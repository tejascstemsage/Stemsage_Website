import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/shared/DataTable';
import FormModal from '../components/shared/FormModal';
import api from '../services/api';
import { contentTypes } from '../config/contentTypes';

export default function ContentPage() {
  const { type } = useParams();
  const config = contentTypes[type];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!config) return;
    try {
      setLoading(true);
      // Always use the admin endpoint so every row (active and inactive) is
      // reachable in the table. The public endpoint filters out inactive rows,
      // which silently hid items and suppressed pagination.
      const endpoint = `admin/${config.endpoint}`;
      const res = await api.get(`/${endpoint}`);
      setData(res.data.data || res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    if (config) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
  }, [config, fetchData]);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <p>Unknown content type: {type}</p>
      </div>
    );
  }

  const handleCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title || item.name || item.subject || 'this item'}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/admin/${config.endpoint}/${item._id || item.id}`);
      toast.success(`${config.singular} deleted`);
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const newActive = !item.isActive;
      await api.put(`/admin/${config.endpoint}/${item._id || item.id}`, { isActive: newActive });
      toast.success(`${config.singular} ${newActive ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (err) {
      console.error('Toggle error:', err);
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (formData) => {
    if (!config.transform) {
      toast.error('Missing transform function');
      return;
    }

    try {
      setSubmitting(true);
      const payload = config.transform(formData);

      if (editingItem) {
        await api.put(`/admin/${config.endpoint}/${editingItem._id || editingItem.id}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
        toast.success(`${config.singular} updated`);
      } else {
        await api.post(`/admin/${config.endpoint}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
        toast.success(`${config.singular} created`);
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Submit error:', err);
      const message = err.response?.data?.message || 'Failed to save';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleMessageStatusChange = async (item, newStatus) => {
    try {
      await api.patch(`/admin/${config.endpoint}/${item._id || item.id}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchData();
    } catch (err) {
      console.error('Status change error:', err);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  // Messages (Contact) special handling
  if (type === 'messages') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
        </div>
        <DataTable
          data={data}
          columns={config.columns}
          keyField="_id"
          onView={handleEdit}
          onDelete={handleDelete}
          searchFields={config.searchFields}
          title={config.title}
          emptyMessage="No messages found."
        />
        <FormModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSubmit={async (formData) => {
            const item = editingItem;
            if (!item) return;
            await handleMessageStatusChange(item, formData.status);
            setModalOpen(false);
          }}
          title={`Change Status: ${editingItem?.subject || editingItem?.name || ''}`}
          schema={config.schema}
          defaultValues={editingItem ? { status: editingItem.status } : {}}
          fields={config.fields}
          isSubmitting={submitting}
          submitLabel="Update Status"
        />
      </div>
    );
  }

  // Blogs special handling (publish toggle)
  const handlePublishToggle = async (item) => {
    try {
      const newPublished = !item.published;
      await api.patch(`/admin/${config.endpoint}/${item._id}/publish`, { published: newPublished });
      toast.success(`Blog ${newPublished ? 'published' : 'unpublished'}`);
      fetchData();
    } catch (err) {
      console.error('Publish toggle error:', err);
      toast.error('Failed to update publish status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
        {!config.isReadOnly && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add {config.singular}
          </button>
        )}
      </div>

      <DataTable
        data={data}
        columns={config.columns}
        keyField="_id"
        onView={handleEdit}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={type === 'blogs' ? undefined : handleToggleActive}
        onPublishToggle={type === 'blogs' ? handlePublishToggle : undefined}
        searchFields={config.searchFields}
        title={config.title}
        emptyMessage={`No ${config.title.toLowerCase()} found.`}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        title={editingItem ? `Edit ${config.singular}` : `Add ${config.singular}`}
        schema={config.schema}
        defaultValues={editingItem ? editingItem : config.defaultValues}
        fields={config.fields}
        isSubmitting={submitting}
        submitLabel={editingItem ? 'Update' : 'Create'}
      />
    </div>
  );
}