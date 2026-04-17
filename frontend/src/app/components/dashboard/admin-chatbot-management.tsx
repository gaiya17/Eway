import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { GlassCard } from '../glass-card';
import apiClient from '@/api/api-client';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Activity
} from 'lucide-react';

interface AdminChatbotManagementProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

interface ChatbotNode {
  id: string;
  parent_id: string | null;
  button_text: string;
  response_text: string | null;
  sort_order: number;
}

export function AdminChatbotManagement({ onLogout, onNavigate }: AdminChatbotManagementProps) {
  const [nodes, setNodes] = useState<ChatbotNode[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    parent_id: '',
    nodeType: 'option', // 'option' or 'answer'
    button_text: '',
    response_text: '',
    sort_order: 0,
  });

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/chatbot/nodes?all=true');
      setNodes(data);
    } catch (error) {
      console.error('Failed to fetch chatbot nodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (parentId: string | null = null) => {
    setIsEditing(false);
    setSelectedNodeId(null);
    setFormData({
      parent_id: parentId || '',
      nodeType: 'option',
      button_text: '',
      response_text: '',
      sort_order: 0,
    });
    setShowNodeModal(true);
  };

  const handleOpenEditModal = (node: ChatbotNode) => {
    setIsEditing(true);
    setSelectedNodeId(node.id);
    setFormData({
      parent_id: node.parent_id || '',
      nodeType: node.response_text ? 'answer' : 'option',
      button_text: node.button_text,
      response_text: node.response_text || '',
      sort_order: node.sort_order,
    });
    setShowNodeModal(true);
  };

  const handleDeleteNode = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this node? All child nodes will also be deleted!')) return;
    try {
      await apiClient.delete(`/chatbot/nodes/${id}`);
      setNodes(nodes.filter((n) => n.id !== id));
      fetchNodes(); // Refresh to clear cascaded deletions from UI
    } catch (error) {
      console.error('Failed to delete node:', error);
      alert('Failed to delete node');
    }
  };

  const handleSaveNode = async () => {
    if (!formData.button_text.trim()) {
      alert('Button Text is required');
      return;
    }

    try {
      const payload = {
        parent_id: formData.parent_id || null,
        button_text: formData.button_text,
        response_text: formData.nodeType === 'answer' ? formData.response_text : null,
        sort_order: Number(formData.sort_order),
      };

      if (isEditing && selectedNodeId) {
        await apiClient.put(`/chatbot/nodes/${selectedNodeId}`, payload);
      } else {
        await apiClient.post('/chatbot/nodes', payload);
      }
      setShowNodeModal(false);
      fetchNodes();
    } catch (error) {
      console.error('Failed to save node:', error);
      alert('Failed to save node. Please try again.');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Helper to get nested tree structure
  const buildTree = (parentId: string | null): ChatbotNode[] => {
    return nodes
      .filter((n) => n.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  const renderNodeTree = (parentNode: ChatbotNode | null = null, depth = 0) => {
    const parentId = parentNode ? parentNode.id : null;
    const children = buildTree(parentId);

    if (children.length === 0) return null;

    return (
      <div className={`space-y-2 ${depth > 0 ? 'ml-6 pl-4 border-l border-white/10 mt-2' : ''}`}>
        {children.map((node) => {
          const hasChildren = buildTree(node.id).length > 0;
          const isExpanded = expandedNodes.has(node.id);
          const isLeaf = !!node.response_text;

          return (
            <div key={node.id}>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpand(node.id)}
                      className="text-white/60 hover:text-white"
                    >
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                  ) : (
                    <div className="w-[18px]" /> // Spacer
                  )}
                  
                  <div className={`p-1.5 rounded-lg ${isLeaf ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    <MessageSquare size={16} />
                  </div>
                  
                  <div>
                    <h3 className="text-white font-semibold text-sm">{node.button_text}</h3>
                    {isLeaf && (
                      <p className="text-white/50 text-xs mt-0.5 max-w-md truncate">{node.response_text}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-xs px-2">Order: {node.sort_order}</span>
                  <button
                    onClick={() => handleOpenAddModal(node.id)}
                    className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                    title="Add Child Node"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(node)}
                    className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="Edit Node"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete Node"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {isExpanded && renderNodeTree(node, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout userRole="admin" activePage="chatbot-management" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Chatbot Knowledge Tree</h1>
              <p className="text-white/60">Configure the decision-tree behavior for the automated student assistant.</p>
            </div>
            <button
              onClick={() => handleOpenAddModal(null)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
            >
              <Plus size={20} />
              Add Root Node
            </button>
          </div>
        </div>

        {/* Info & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-white/60 text-sm">Total Nodes</p>
                        <p className="text-3xl text-white font-bold">{nodes.length}</p>
                    </div>
                </div>
            </GlassCard>
            <GlassCard className="p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <p className="text-white/60 text-sm">Root Categories</p>
                        <p className="text-3xl text-white font-bold">{nodes.filter(n => !n.parent_id).length}</p>
                    </div>
                </div>
            </GlassCard>
        </div>

        {/* Tree View Manager */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Conversation Flows</h2>
          {loading ? (
            <div className="text-center py-8 text-white/60">Loading chatbot nodes...</div>
          ) : (
            <div>
              {nodes.length === 0 ? (
                <div className="text-center py-12 border border-white/5 rounded-xl bg-white/5 disabled">
                  <p className="text-white/60 mb-4">No chatbot nodes created yet.</p>
                  <button
                    onClick={() => handleOpenAddModal(null)}
                    className="px-6 py-2 rounded-xl bg-blue-500/20 text-blue-400 font-semibold hover:bg-blue-500/30 transition-colors"
                  >
                    Create First Category
                  </button>
                </div>
              ) : (
                renderNodeTree(null, 0)
              )}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Add / Edit Node Modal */}
      {showNodeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {isEditing ? 'Edit Node' : 'Add New Node'}
                </h2>
                <button
                  onClick={() => setShowNodeModal(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Button Label <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="e.g. How to upload an assignment"
                  />
                  <p className="text-white/40 text-xs mt-1">This text appears on the button the student clicks.</p>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Parent Node (Optional)</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-colors [&>option]:bg-[#0f172a]"
                  >
                    <option value="">-- No Parent (Root Level Category) --</option>
                    {nodes
                      .filter((n) => n.id !== selectedNodeId) // Prevent cyclic parenting
                      .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.button_text}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Node Type</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, nodeType: 'option' })}
                      className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                        formData.nodeType === 'option' 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                          : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Branch (More Buttons)
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, nodeType: 'answer' })}
                      className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                        formData.nodeType === 'answer' 
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' 
                          : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Leaf (Final Answer)
                    </button>
                  </div>
                </div>

                {formData.nodeType === 'answer' && (
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2">
                      Final Answer Text <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.response_text}
                      onChange={(e) => setFormData({ ...formData, response_text: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                      placeholder="e.g. To upload an assignment, go to 'My Classes', select the class, and click the Upload arrow."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  <p className="text-white/40 text-xs mt-1">Lower numbers appear first (e.g. 1 comes before 2).</p>
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => setShowNodeModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNode}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300"
                >
                  {isEditing ? 'Save Changes' : 'Create Node'}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}
