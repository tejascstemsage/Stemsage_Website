import * as z from 'zod';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-');

export const contentTypes = {
  products: {
    endpoint: 'products',
    title: 'Products',
    singular: 'Product',
    searchFields: ['title', 'slug', 'category'],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'price', label: 'Price (₹)', render: (row) => (row.price ? `₹${row.price.toLocaleString()}` : '—') },
      { key: 'isFeatured', label: 'Featured', render: (row) => (row.isFeatured ? '★' : '—') },
      { key: 'showOnHome', label: 'Home', render: (row) => (row.showOnHome ? '✓' : '—') },
      { key: 'isActive', label: 'Active' },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'slug', label: 'Slug', required: true, description: 'Auto-generated from title if left empty' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'price', label: 'Price (₹)', type: 'number', required: true, min: 0 },
      { name: 'category', label: 'Category', required: true },
      { name: 'images', label: 'Images', type: 'images', required: true },
      { name: 'features', label: 'Features (one per line)', type: 'textarea', description: 'Each line becomes a feature' },
      { name: 'tags', label: 'Tags (comma separated)', description: 'e.g. Arduino, Robotics, Kit' },
      { name: 'isFeatured', label: 'Featured', type: 'checkbox' },
      { name: 'showOnHome', label: 'Show on Home', type: 'checkbox' },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
    schema: z.object({
      title: z.string().min(1, 'Title is required'),
      slug: z.string().optional(),
      description: z.string().optional(),
      price: z.number().min(0, 'Price must be positive'),
      category: z.string().min(1, 'Category is required'),
      images: z.array(z.instanceof(File)).min(1, 'At least one image is required'),
      features: z.string().optional(),
      tags: z.string().optional(),
      isFeatured: z.boolean().optional(),
      showOnHome: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }),
    transform: (data) => ({
      title: data.title,
      slug: data.slug || slugify(data.title),
      description: data.description || '',
      price: Number(data.price) || 0,
      category: data.category,
      images: data.images,
      features: data.features ? data.features.split('\n').map((f) => f.trim()).filter(Boolean) : [],
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      isFeatured: Boolean(data.isFeatured),
      showOnHome: Boolean(data.showOnHome),
      isActive: data.isActive !== undefined ? data.isActive : true,
    }),
    defaultValues: {
      isActive: true,
      isFeatured: false,
      showOnHome: false,
    },
  },

  services: {
    endpoint: 'services',
    title: 'Services',
    singular: 'Service',
    searchFields: ['title'],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description', render: (row) => (row.description ? row.description.substring(0, 60) + '...' : '—') },
      { key: 'isActive', label: 'Active' },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 4 },
      { name: 'image', label: 'Image', type: 'image', required: true },
      { name: 'buttonText', label: 'Button Text', required: true },
      { name: 'link', label: 'Link', required: true },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
    schema: z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      image: z.preprocess(
        (v) => (typeof v === 'string' && v ? { url: v } : v),
        z.object({ url: z.string().min(1), publicId: z.string().optional() })
      ),
      buttonText: z.string().min(1, 'Button text is required'),
      link: z.string().min(1, 'Link is required'),
      isActive: z.boolean().optional(),
    }),
    transform: (data) => {
      const img = data.image;
      // Normalise to {url, publicId} object
      if (!img) return { title: data.title, description: data.description, image: null, buttonText: data.buttonText, link: data.link, isActive: data.isActive !== undefined ? data.isActive : true };
      if (typeof img === 'string') return { title: data.title, description: data.description, image: { url: img }, buttonText: data.buttonText, link: data.link, isActive: data.isActive !== undefined ? data.isActive : true };
      if (typeof img === 'object' && img?.url) return { title: data.title, description: data.description, image: { url: img.url, publicId: img.publicId }, buttonText: data.buttonText, link: data.link, isActive: data.isActive !== undefined ? data.isActive : true };
      return { title: data.title, description: data.description, image: { url: img?.url || '' }, buttonText: data.buttonText, link: data.link, isActive: data.isActive !== undefined ? data.isActive : true };
    },
    defaultValues: { isActive: true },
  },

  courses: {
    endpoint: 'courses',
    title: 'Courses',
    singular: 'Course',
    searchFields: ['title', 'category', 'level'],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'level', label: 'Level' },
      { key: 'duration', label: 'Duration' },
      { key: 'mode', label: 'Mode' },
      { key: 'price', label: 'Price (₹)', render: (row) => (row.price ? `₹${row.price.toLocaleString()}` : '—') },
      { key: 'isActive', label: 'Active' },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'category', label: 'Category', required: true },
      { name: 'level', label: 'Level', required: true },
      { name: 'duration', label: 'Duration', required: true },
      { name: 'mode', label: 'Mode', required: true },
      { name: 'price', label: 'Price (₹)', type: 'number', required: true, min: 0 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'tags', label: 'Tags (comma separated)' },
      { name: 'detail.overview', label: 'Overview', type: 'textarea', rows: 2 },
      { name: 'detail.outcome', label: 'Outcome', type: 'textarea', rows: 2 },
      { name: 'detail.syllabus', label: 'Syllabus (one per line)', type: 'textarea', rows: 4 },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
    schema: z.object({
      title: z.string().min(1, 'Title is required'),
      category: z.string().min(1, 'Category is required'),
      level: z.string().min(1, 'Level is required'),
      duration: z.string().min(1, 'Duration is required'),
      mode: z.string().min(1, 'Mode is required'),
      price: z.number().min(0, 'Price must be positive'),
      description: z.string().optional(),
      tags: z.string().optional(),
      detail: z.object({
        overview: z.string().optional(),
        outcome: z.string().optional(),
        syllabus: z.string().optional(),
      }).optional(),
      isActive: z.boolean().optional(),
    }),
    transform: (data) => ({
      title: data.title,
      category: data.category,
      level: data.level,
      duration: data.duration,
      mode: data.mode,
      price: Number(data.price) || 0,
      description: data.description || '',
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      detail: {
        overview: data['detail.overview'] || '',
        outcome: data['detail.outcome'] || '',
        syllabus: data['detail.syllabus'] ? data['detail.syllabus'].split('\n').map((s) => s.trim()).filter(Boolean) : [],
      },
      isActive: data.isActive !== undefined ? data.isActive : true,
    }),
    defaultValues: { isActive: true },
  },

  testimonials: {
    endpoint: 'testimonials',
    title: 'Testimonials',
    singular: 'Testimonial',
    searchFields: ['name', 'role'],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'type', label: 'Type' },
      { key: 'isActive', label: 'Active' },
    ],
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'role', label: 'Role', required: true },
      { name: 'type', label: 'Type', required: true, type: 'select', options: [
        { value: 'text', label: 'Text' },
        { value: 'video', label: 'Video' },
      ]},
      { name: 'quote', label: 'Quote', type: 'textarea', rows: 4, description: 'Required for text type' },
      { name: 'videoSrc', label: 'Video URL', type: 'url', description: 'Required for video type' },
      { name: 'avatar', label: 'Avatar Image', type: 'image', required: true },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
    schema: z.object({
      name: z.string().min(1, 'Name is required'),
      role: z.string().min(1, 'Role is required'),
      type: z.enum(['text', 'video']),
      quote: z.string().optional(),
      videoSrc: z.string().url().optional().or(z.literal('')),
      avatar: z.preprocess(
        (v) => (typeof v === 'string' && v ? { url: v } : v),
        z.object({ url: z.string().min(1), publicId: z.string().optional() })
      ),
      isActive: z.boolean().optional(),
    }).refine((data) => data.type === 'video' || (data.quote && data.quote.trim()), {
      message: 'Quote is required for text testimonials',
      path: ['quote'],
    }),
    transform: (data) => {
      const img = data.avatar;
      if (!img) return { name: data.name, role: data.role, type: data.type, quote: data.type === 'text' ? data.quote : '', videoSrc: data.type === 'video' ? data.videoSrc : '', avatar: null, isActive: data.isActive !== undefined ? data.isActive : true };
      if (typeof img === 'string') return { name: data.name, role: data.role, type: data.type, quote: data.type === 'text' ? data.quote : '', videoSrc: data.type === 'video' ? data.videoSrc : '', avatar: { url: img }, isActive: data.isActive !== undefined ? data.isActive : true };
      if (typeof img === 'object' && img?.url) return { name: data.name, role: data.role, type: data.type, quote: data.type === 'text' ? data.quote : '', videoSrc: data.type === 'video' ? data.videoSrc : '', avatar: { url: img.url, publicId: img.publicId }, isActive: data.isActive !== undefined ? data.isActive : true };
      return { name: data.name, role: data.role, type: data.type, quote: data.type === 'text' ? data.quote : '', videoSrc: data.type === 'video' ? data.videoSrc : '', avatar: { url: img?.url || '' }, isActive: data.isActive !== undefined ? data.isActive : true };
    },
    defaultValues: { isActive: true, type: 'text' },
  },

  news: {
    endpoint: 'news',
    title: 'News',
    singular: 'News Item',
    searchFields: ['title', 'tag'],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'tag', label: 'Tag' },
      { key: 'date', label: 'Date' },
      { key: 'isActive', label: 'Active' },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'tag', label: 'Tag', required: true },
      { name: 'date', label: 'Date', required: true },
      { name: 'image', label: 'Image', type: 'image', required: true },
      { name: 'link', label: 'Link', required: true },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
    schema: z.object({
      title: z.string().min(1, 'Title is required'),
      tag: z.string().min(1, 'Tag is required'),
      date: z.string().min(1, 'Date is required'),
      image: z.preprocess(
        (v) => (typeof v === 'string' && v ? { url: v } : v),
        z.object({ url: z.string().min(1), publicId: z.string().optional() })
      ),
      link: z.string().min(1, 'Link is required'),
      isActive: z.boolean().optional(),
    }),
    transform: (data) => {
      const img = data.image;
      if (!img) return { title: data.title, tag: data.tag, date: data.date, image: null, link: data.link, isActive: data.isActive !== undefined ? data.isActive : true };
      if (typeof img === 'string') return { title: data.title, tag: data.tag, date: data.date, image: { url: img }, link: data.link, isActive: data.isActive !== undefined ? data.isActive : true };
      if (typeof img === 'object' && img?.url) return { title: data.title, tag: data.tag, date: data.date, image: { url: img.url, publicId: img.publicId }, link: data.link, isActive: data.isActive !== undefined ? data.isActive : true };
      return { title: data.title, tag: data.tag, date: data.date, image: { url: img?.url || '' }, link: data.link, isActive: data.isActive !== undefined ? data.isActive : true };
    },
    defaultValues: { isActive: true },
  },

  gallery: {
    endpoint: 'gallery',
    title: 'Gallery',
    singular: 'Gallery Image',
    searchFields: ['title'],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'isActive', label: 'Active' },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'image', label: 'Image', type: 'image', required: true },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
    schema: z.object({
      title: z.string().min(1, 'Title is required'),
      image: z.preprocess(
        (v) => (typeof v === 'string' && v ? { url: v } : v),
        z.object({ url: z.string().min(1), publicId: z.string().optional() })
      ),
      isActive: z.boolean().optional(),
    }),
    transform: (data) => {
      const img = data.image;
      if (!img) return { title: data.title, image: null, isActive: data.isActive !== undefined ? data.isActive : true };
      if (typeof img === 'string') return { title: data.title, image: { url: img }, isActive: data.isActive !== undefined ? data.isActive : true };
      if (typeof img === 'object' && img?.url) return { title: data.title, image: { url: img.url, publicId: img.publicId }, isActive: data.isActive !== undefined ? data.isActive : true };
      return { title: data.title, image: { url: img?.url || '' }, isActive: data.isActive !== undefined ? data.isActive : true };
    },
    defaultValues: { isActive: true },
  },

  associations: {
    endpoint: 'associations',
    title: 'Associations',
    singular: 'Association Logo',
    searchFields: ['name'],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'isActive', label: 'Active' },
    ],
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'src', label: 'Logo Image', type: 'image', required: true },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
    schema: z.object({
      name: z.string().min(1, 'Name is required'),
      src: z.preprocess(
        (v) => (typeof v === 'string' && v ? { url: v } : v),
        z.object({ url: z.string().min(1), publicId: z.string().optional() })
      ),
      isActive: z.boolean().optional(),
    }),
    transform: (data) => {
      const src = data.src;
      if (!src) return { name: data.name, src: null, isActive: data.isActive !== undefined ? data.isActive : true };
      if (typeof src === 'string') return { name: data.name, src: { url: src }, isActive: data.isActive !== undefined ? data.isActive : true };
      if (typeof src === 'object' && src?.url) return { name: data.name, src: { url: src.url, publicId: src.publicId }, isActive: data.isActive !== undefined ? data.isActive : true };
      return { name: data.name, src: { url: src?.url || '' }, isActive: data.isActive !== undefined ? data.isActive : true };
    },
    defaultValues: { isActive: true },
  },

  innovations: {
    endpoint: 'innovations',
    title: 'Innovations',
    singular: 'Innovation Door',
    searchFields: ['name'],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'isActive', label: 'Active' },
    ],
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'gif', label: 'GIF Animation', type: 'gif', required: true },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
    schema: z.object({
      name: z.string().min(1, 'Name is required'),
      gif: z.preprocess(
        (v) => (typeof v === 'string' && v ? { url: v } : v),
        z.object({ url: z.string().min(1), publicId: z.string().optional() })
      ),
      isActive: z.boolean().optional(),
    }),
    transform: (data) => {
      const gif = data.gif;
      if (!gif) return { name: data.name, gif: null, isActive: data.isActive !== undefined ? data.isActive : true };
      if (typeof gif === 'string') return { name: data.name, gif: { url: gif }, isActive: data.isActive !== undefined ? data.isActive : true };
      if (typeof gif === 'object' && gif?.url) return { name: data.name, gif: { url: gif.url, publicId: gif.publicId }, isActive: data.isActive !== undefined ? data.isActive : true };
      return { name: data.name, gif: { url: gif?.url || '' }, isActive: data.isActive !== undefined ? data.isActive : true };
    },
    defaultValues: { isActive: true },
  },

  blogs: {
    endpoint: 'blogs',
    title: 'Blogs',
    singular: 'Blog',
    searchFields: ['title', 'category', 'tags'],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'published', label: 'Published', render: (row) => row.published ? 'Yes' : 'No' },
      { key: 'publishedAt', label: 'Published At', render: (row) => row.publishedAt ? new Date(row.publishedAt).toLocaleDateString() : '—' },
      { key: 'isActive', label: 'Active' },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'slug', label: 'Slug', description: 'Auto-generated from title if left empty' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2 },
      { name: 'content', label: 'Content', type: 'textarea', rows: 6, required: true },
      { name: 'coverImage', label: 'Cover Image', type: 'image' },
      { name: 'category', label: 'Category', required: true },
      { name: 'tags', label: 'Tags (comma separated)' },
      { name: 'published', label: 'Published', type: 'checkbox' },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
    schema: z.object({
      title: z.string().min(1, 'Title is required'),
      slug: z.string().optional(),
      excerpt: z.string().optional(),
      content: z.string().min(1, 'Content is required'),
      coverImage: z.instanceof(File).optional(),
      category: z.string().min(1, 'Category is required'),
      tags: z.string().optional(),
      published: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }),
    transform: (data) => ({
      title: data.title,
      slug: data.slug || slugify(data.title),
      excerpt: data.excerpt || (data.content ? data.content.substring(0, 160) : ''),
      content: data.content,
      coverImage: data.coverImage || '',
      category: data.category,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      published: data.published !== undefined ? data.published : true,
      publishedAt: data.published ? new Date() : null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    }),
    defaultValues: { isActive: true, published: true },
  },

  messages: {
    endpoint: 'contact',
    title: 'Messages',
    singular: 'Message',
    searchFields: ['name', 'email', 'subject'],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'subject', label: 'Subject' },
      { key: 'status', label: 'Status', render: (row) => row.status },
      { key: 'createdAt', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    ],
    fields: [
      { name: 'status', label: 'Status', type: 'select', options: [
        { value: 'NEW', label: 'New' },
        { value: 'IN_REVIEW', label: 'In Review' },
        { value: 'REPLIED', label: 'Replied' },
        { value: 'ARCHIVED', label: 'Archived' },
      ]},
    ],
    schema: z.object({
      status: z.string().min(1, 'Status is required'),
    }),
    transform: (data) => ({
      status: data.status,
    }),
    defaultValues: {},
    isReadOnly: true,
  },
};

export default contentTypes;