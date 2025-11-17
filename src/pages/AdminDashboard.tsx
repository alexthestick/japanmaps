import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';
import { AddStoreForm } from '../components/forms/AddStoreForm';
import { EditStoreForm } from '../components/forms/EditStoreForm';
import { StoreListTable } from '../components/admin/StoreListTable';
import { MainCategoryMigration } from '../components/admin/MainCategoryMigration';
import { NeighborhoodList } from '../components/admin/NeighborhoodList';
import { BlogPostEditor } from '../components/admin/BlogPostEditor';
import { Modal } from '../components/common/Modal';
import type { StoreSuggestion, Store } from '../types/store';

export function AdminDashboard() {
  const { user, loading: authLoading, isAdmin, checkingAdmin, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [suggestions, setSuggestions] = useState<StoreSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showAddStoreForm, setShowAddStoreForm] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deletingStore, setDeletingStore] = useState<Store | null>(null);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loadingBlogPosts, setLoadingBlogPosts] = useState(false);
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'stores' | 'suggestions' | 'migration' | 'neighborhoods' | 'blog'>('stores');

  useEffect(() => {
    if (user) {
      fetchSuggestions();
      fetchStores();
      fetchBlogPosts();
    }
  }, [user]);

  async function fetchSuggestions() {
    try {
      setLoadingSuggestions(true);
      const { data, error } = await supabase
        .from('store_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedSuggestions: StoreSuggestion[] = (data || []).map((s: any) => ({
        id: s.id,
        submitterName: s.submitter_name || undefined,
        submitterEmail: s.submitter_email,
        storeName: s.store_name,
        city: s.city,
        country: s.country,
        address: s.address || '',
        reason: s.reason,
        instagram: s.instagram || undefined,
        website: s.website || undefined,
        status: s.status as any,
        createdAt: s.created_at,
      }));

      setSuggestions(transformedSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) {
      alert('Login failed: ' + error.message);
    }
  }

  async function fetchStores() {
    try {
      setLoadingStores(true);
      const { data, error } = await supabase.rpc('get_stores_with_coordinates');

      if (error) throw error;

      const transformedStores: Store[] = (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        address: s.address,
        city: s.city,
        neighborhood: s.neighborhood || undefined,
        country: s.country,
        latitude: s.latitude,
        longitude: s.longitude,
        mainCategory: s.main_category || 'Fashion',
        categories: s.categories,
        priceRange: s.price_range || undefined,
        description: s.description || undefined,
        photos: s.photos || [],
        website: s.website || undefined,
        instagram: s.instagram || undefined,
        hours: s.hours || undefined,
        verified: s.verified,
        submittedBy: s.submitted_by || undefined,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
        haulCount: s.haul_count || 0,
        saveCount: s.save_count || 0,
        google_place_id: s.google_place_id || undefined,
      }));

      setStores(transformedStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoadingStores(false);
    }
  }

  async function handleStatusChange(id: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await (supabase
        .from('store_suggestions') as any)
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      fetchSuggestions();
    } catch (error) {
      console.error('Error updating suggestion:', error);
      alert('Failed to update suggestion');
    }
  }

  async function handleDeleteStore(store: Store) {
    if (!confirm(`Are you sure you want to delete "${store.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', store.id);

      if (error) throw error;

      alert('Store deleted successfully!');
      setDeletingStore(null);
      fetchStores();
    } catch (error) {
      console.error('Error deleting store:', error);
      alert('Failed to delete store. Please try again.');
    }
  }

  async function fetchBlogPosts() {
    try {
      setLoadingBlogPosts(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;

      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoadingBlogPosts(false);
    }
  }

  async function handleDeletePost(post: any) {
    if (!confirm(`Are you sure you want to delete "${post.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      alert('Post deleted successfully!');
      fetchBlogPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  }

  if (authLoading || checkingAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loader message="Loading..." />
      </div>
    );
  }

  // Not logged in - show login form
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h1>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // User is logged in but not an admin
  if (user && !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You do not have permission to access the admin dashboard.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Logged in as:</strong> {user.email}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>User ID:</strong> {user.id}
            </p>
            <p className="text-sm text-gray-600">
              To become an admin, you need to run the SQL migration in Supabase and set your account as admin.
              Check the ADMIN_SETUP_INSTRUCTIONS.md file for details.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Map
            </Button>
            <Button onClick={() => signOut()} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User is logged in and is an admin - show admin dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAddStoreForm(true);
            }}
            type="button"
          >
            Add New Store
          </Button>
          <Button variant="outline" onClick={() => signOut()} type="button">
            Sign Out
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'stores'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All Stores ({stores.length})
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'suggestions'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Suggestions ({suggestions.filter(s => s.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('migration')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'migration'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🏷️ Category Migration
        </button>
        <button
          onClick={() => setActiveTab('neighborhoods')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'neighborhoods'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📍 Neighborhoods
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'blog'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📝 Blog Posts ({blogPosts.length})
        </button>
      </div>

      {/* Store List Tab */}
      {activeTab === 'stores' && (
        <div>
          {loadingStores ? (
            <div className="bg-white rounded-lg shadow-md p-8">
              <Loader message="Loading stores..." />
            </div>
          ) : (
            <StoreListTable
              stores={stores}
              onEdit={(store) => setEditingStore(store)}
              onDelete={handleDeleteStore}
            />
          )}
        </div>
      )}

      {/* Store Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Store Suggestions
            {loadingSuggestions && <span className="text-sm text-gray-500 ml-2">(Loading...)</span>}
          </h2>

        {suggestions.length === 0 ? (
          <p className="text-gray-600">No suggestions yet.</p>
        ) : (
          <div className="space-y-4">
            {suggestions.map(suggestion => (
              <div
                key={suggestion.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{suggestion.storeName}</h3>
                    <p className="text-sm text-gray-600">
                      {suggestion.city}, {suggestion.country}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      suggestion.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : suggestion.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {suggestion.status}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-2">
                  <strong>Reason:</strong> {suggestion.reason}
                </p>

                {suggestion.address && (
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Address:</strong> {suggestion.address}
                  </p>
                )}

                {suggestion.submitterEmail && (
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Submitted by:</strong> {suggestion.submitterName || 'Anonymous'} ({suggestion.submitterEmail})
                  </p>
                )}

                {suggestion.instagram && (
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Instagram:</strong> {suggestion.instagram}
                  </p>
                )}

                {suggestion.website && (
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Website:</strong>{' '}
                    <a
                      href={suggestion.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {suggestion.website}
                    </a>
                  </p>
                )}

                {suggestion.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(suggestion.id!, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(suggestion.id!, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      )}

      {/* Migration Tab */}
      {activeTab === 'migration' && (
        <MainCategoryMigration />
      )}

      {/* Neighborhoods Tab */}
      {activeTab === 'neighborhoods' && (
        <NeighborhoodList />
      )}

      {/* Blog Posts Tab */}
      {activeTab === 'blog' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Blog Posts
              {loadingBlogPosts && <span className="text-sm text-gray-500 ml-2">(Loading...)</span>}
            </h2>
            <Button
              onClick={() => {
                setEditingPost(null);
                setShowBlogEditor(true);
              }}
            >
              + New Post
            </Button>
          </div>

          {blogPosts.length === 0 ? (
            <p className="text-gray-600 text-center py-12">
              No blog posts yet. Create your first post to get started!
            </p>
          ) : (
            <div className="space-y-4">
              {blogPosts.map(post => (
                <div
                  key={post.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {post.title}
                      </h3>
                      <div className="flex gap-4 text-sm text-gray-600 mb-2">
                        <span>Slug: <code className="bg-gray-100 px-1 rounded">{post.slug}</code></span>
                        <span>Published: {new Date(post.published_at).toLocaleDateString()}</span>
                      </div>
                      {post.hero_image && (
                        <img 
                          src={post.hero_image} 
                          alt={post.title} 
                          className="w-32 h-20 object-cover rounded-md mb-2"
                        />
                      )}
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.content.slice(0, 200)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPost(post);
                        setShowBlogEditor(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePost(post)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Store Modal */}
      <Modal
        isOpen={showAddStoreForm}
        onClose={() => setShowAddStoreForm(false)}
        title="Add New Store"
        maxWidth="2xl"
      >
        <AddStoreForm
          onSuccess={() => {
            setShowAddStoreForm(false);
            fetchStores();
          }}
          onCancel={() => setShowAddStoreForm(false)}
        />
      </Modal>

      {/* Edit Store Modal */}
      <Modal
        isOpen={!!editingStore}
        onClose={() => setEditingStore(null)}
        title={editingStore ? `Edit: ${editingStore.name}` : ''}
        maxWidth="2xl"
      >
        {editingStore && (
          <EditStoreForm
            store={editingStore}
            onSuccess={() => {
              setEditingStore(null);
              fetchStores();
            }}
            onCancel={() => setEditingStore(null)}
          />
        )}
      </Modal>

      {/* Blog Post Editor Modal */}
      <Modal
        isOpen={showBlogEditor}
        onClose={() => {
          setShowBlogEditor(false);
          setEditingPost(null);
        }}
        title={editingPost ? `Edit: ${editingPost.title}` : 'Create New Blog Post'}
        maxWidth="4xl"
      >
        <BlogPostEditor
          post={editingPost}
          onSuccess={() => {
            setShowBlogEditor(false);
            setEditingPost(null);
            fetchBlogPosts();
          }}
          onCancel={() => {
            setShowBlogEditor(false);
            setEditingPost(null);
          }}
        />
      </Modal>
    </div>
  );
}

