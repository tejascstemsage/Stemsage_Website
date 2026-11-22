const { deleteFromCloudinary, deleteByPublicId } = require('../services/cloudinary.service');

// Allowed query filters per model for PUBLIC list routes.
// Only whitelisted keys are applied; no operator injection.
// isActive is ALWAYS forced to true on public routes and is never exposed as a query param.
const QUERY_FILTERS = {
  products: {
    boolean: ['showOnHome', 'isFeatured'],
    string: ['category'],
    number: ['limit']
  },
  services: {
    boolean: [],
    string: ['category'],
    number: ['limit']
  },
  courses: {
    boolean: [],
    string: ['category', 'level', 'mode'],
    number: ['limit']
  },
  testimonials: {
    boolean: [],
    string: ['type'],
    number: ['limit']
  },
  news: {
    boolean: [],
    string: ['tag'],
    number: ['limit']
  },
  gallery: {
    boolean: [],
    string: [],
    number: ['limit']
  },
  associations: {
    boolean: [],
    string: [],
    number: ['limit']
  },
  innovations: {
    boolean: [],
    string: [],
    number: ['limit']
  }
};

function buildQueryFilter(modelName, query) {
  const config = QUERY_FILTERS[modelName];
  if (!config) return { filter: { isActive: true }, limit: null };

  // Public list routes always force isActive: true
  const filter = { isActive: true };

  if (config.boolean) {
    for (const key of config.boolean) {
      if (query[key] !== undefined) {
        const val = query[key];
        if (typeof val === 'string') {
          if (val.toLowerCase() === 'true') filter[key] = true;
          else if (val.toLowerCase() === 'false') filter[key] = false;
        } else if (typeof val === 'boolean') {
          filter[key] = val;
        }
      }
    }
  }

  if (config.string) {
    for (const key of config.string) {
      if (query[key] !== undefined && query[key] !== '') {
        // Never allow operator keys like category[$ne]=x
        if (key.includes('[') || key.includes('$')) continue;
        filter[key] = String(query[key]);
      }
    }
  }

  let limit = null;
  if (config.number && config.number.includes('limit')) {
    const n = parseInt(query.limit, 10);
    if (!isNaN(n) && n > 0) limit = n;
  }

  return { filter, limit };
}

const IMAGE_FIELDS = ['image', 'avatar', 'src', 'gif']; // single-image fields across models
const isOwnPublicId = (id) => typeof id === 'string' && id.startsWith('stemsage/');

// Turn { url, publicId } objects from the admin into the model's string field + <field>PublicId
function normalizeImageData(body) {
  const data = { ...body };

  for (const field of IMAGE_FIELDS) {
    const v = data[field];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      data[field] = v.url;
      if (isOwnPublicId(v.publicId)) data[`${field}PublicId`] = v.publicId;
    }
  }

  // Products: images array of { url, publicId } or strings
  if (Array.isArray(data.images)) {
    data.images = data.images
      .map((img) =>
        typeof img === 'string'
          ? { url: img }
          : { url: img?.url, publicId: isOwnPublicId(img?.publicId) ? img.publicId : undefined }
      )
      .filter((img) => img.url);
  }
  return data;
}

// All Cloudinary public IDs stored on a document
// Every image on a document as { url, publicId }
function collectAssets(doc) {
  if (!doc) return [];
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const assets = [];

  for (const field of IMAGE_FIELDS) {
    if (typeof obj[field] === 'string' && obj[field]) {
      const pid = obj[`${field}PublicId`];
      assets.push({ url: obj[field], publicId: isOwnPublicId(pid) ? pid : undefined });
    }
  }
  if (Array.isArray(obj.images)) {
    obj.images.forEach((img) => {
      if (img?.url) assets.push({ url: img.url, publicId: isOwnPublicId(img.publicId) ? img.publicId : undefined });
    });
  }
  return assets;
}

// Prefer the stored public_id; fall back to URL parsing for older seeded items.
// A Cloudinary failure must never break the request.
async function removeAssets(assets) {
  await Promise.allSettled(
    assets.map((a) => (a.publicId ? deleteByPublicId(a.publicId) : deleteFromCloudinary(a.url)))
  );
}

const factory = {
  // Public: active items sorted by order, with whitelisted filters
  getAll: (Model) => async (req, res) => {
    try {
      const { filter, limit } = buildQueryFilter(req.modelName, req.query);
      let q = Model.find(filter).sort({ order: 1 });
      if (limit) q = q.limit(limit);
      const data = await q;
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getOne: (Model) => async (req, res) => {
    try {
      const data = await Model.findById(req.params.id);
      if (!data || !data.isActive) return res.status(404).json({ success: false, message: 'Not found' });
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  adminGetAll: (Model) => async (req, res) => {
    try {
      const data = await Model.find().sort({ order: 1 });
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  create: (Model) => async (req, res) => {
    try {
      const data = await Model.create(normalizeImageData(req.body));
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  update: (Model) => async (req, res) => {
    try {
      const old = await Model.findById(req.params.id);
      if (!old) return res.status(404).json({ success: false, message: 'Not found' });

      const oldAssets = collectAssets(old);

      const data = await Model.findByIdAndUpdate(
        req.params.id,
        normalizeImageData(req.body),
        { new: true, runValidators: true }
      );

      // Delete only assets no longer referenced, and only after the save succeeded
      const keepUrls = new Set(collectAssets(data).map((a) => a.url));
      await removeAssets(oldAssets.filter((a) => !keepUrls.has(a.url)));

      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  reorder: (Model) => async (req, res) => {
    try {
      const { items } = req.body; // [{id, order}]
      await Promise.all(items.map((item) => Model.findByIdAndUpdate(item.id, { order: item.order })));
      res.status(200).json({ success: true, message: 'Reordered successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

    delete: (Model) => async (req, res) => {
    try {
      const data = await Model.findById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Not found' });

      const assets = collectAssets(data);
      await data.deleteOne();
      await removeAssets(assets);

      res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = factory;