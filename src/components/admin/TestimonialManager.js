import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  MoveUp, 
  MoveDown,
  Eye,
  EyeOff,
  RotateCw,
  Settings,
  Star,
  MessageSquare
} from 'lucide-react';

export const TestimonialManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [newTestimonial, setNewTestimonial] = useState({ 
    author_name: '', 
    author_title: '', 
    company: '', 
    message: '', 
    star_rating: 5,
    metric_value: '',
    metric_label: '',
    order_index: 0, 
    active: true 
  });
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Testimonial Settings state
  const [settings, setSettings] = useState({ transition_delay: 8, auto_rotation: true });
  const [editingSettings, setEditingSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState({ transition_delay: 8, auto_rotation: true });

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    loadTestimonials();
    loadSettings();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/testimonials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTestimonials(response.data.testimonials || []);
    } catch (error) {
      setError('Failed to load testimonials');
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/testimonial/settings`);
      
      if (response.data && response.data.settings) {
        setSettings(response.data.settings);
        setTempSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error loading testimonial settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/testimonial/settings`, tempSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSettings(tempSettings);
      setEditingSettings(false);
      setError(null);
    } catch (error) {
      setError('Failed to update testimonial settings');
      console.error('Error updating settings:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Set order_index to be the next available index
      const maxOrderIndex = Math.max(...testimonials.map(t => t.order_index), -1);
      const testimonialData = {
        ...newTestimonial,
        order_index: maxOrderIndex + 1
      };
      
      await axios.post(`${API_URL}/api/testimonials`, testimonialData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewTestimonial({ 
        author_name: '', 
        author_title: '', 
        company: '', 
        message: '', 
        star_rating: 5,
        metric_value: '',
        metric_label: '',
        order_index: 0, 
        active: true 
      });
      setShowAddForm(false);
      loadTestimonials();
    } catch (error) {
      setError('Failed to create testimonial');
      console.error('Error creating testimonial:', error);
    }
  };

  const handleUpdate = async (testimonialId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/testimonials/${testimonialId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEditingTestimonial(null);
      loadTestimonials();
    } catch (error) {
      setError('Failed to update testimonial');
      console.error('Error updating testimonial:', error);
    }
  };

  const handleDelete = async (testimonialId) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/testimonials/${testimonialId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      loadTestimonials();
    } catch (error) {
      setError('Failed to delete testimonial');
      console.error('Error deleting testimonial:', error);
    }
  };

  const moveTestimonial = (testimonialId, direction) => {
    const testimonialIndex = testimonials.findIndex(t => t.id === testimonialId);
    if (testimonialIndex === -1) return;

    const newTestimonials = [...testimonials];
    const targetIndex = direction === 'up' ? testimonialIndex - 1 : testimonialIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newTestimonials.length) return;

    [newTestimonials[testimonialIndex], newTestimonials[targetIndex]] = [newTestimonials[targetIndex], newTestimonials[testimonialIndex]];
    
    newTestimonials.forEach((testimonial, index) => {
      testimonial.order_index = index;
    });
    
    setTestimonials(newTestimonials);
    
    newTestimonials.forEach(async (testimonial) => {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/api/testimonials/${testimonial.id}`, 
          { order_index: testimonial.order_index }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error updating testimonial order:', error);
      }
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RotateCw className="h-6 w-6 animate-spin mr-2" />
        Loading testimonials...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testimonial Management</h2>
          <p className="text-gray-600">Manage user testimonials displayed on the homepage</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Testimonial Carousel Settings */}
      <Card className="border-amber-200">
        <CardHeader className="bg-amber-50">
          <CardTitle className="text-amber-800 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Testimonial Carousel Settings
          </CardTitle>
          <CardDescription>Configure testimonial carousel timing and behavior</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {editingSettings ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testimonial-transition-delay">Transition Delay (seconds)</Label>
                  <Input
                    id="testimonial-transition-delay"
                    type="number"
                    min="3"
                    max="30"
                    value={tempSettings.transition_delay}
                    onChange={(e) => setTempSettings({ 
                      ...tempSettings, 
                      transition_delay: parseInt(e.target.value) || 8 
                    })}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Time between testimonial transitions (3-30 seconds)</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="testimonial-auto-rotation"
                    checked={tempSettings.auto_rotation}
                    onChange={(e) => setTempSettings({ 
                      ...tempSettings, 
                      auto_rotation: e.target.checked 
                    })}
                    className="h-4 w-4 text-amber-600"
                  />
                  <Label htmlFor="testimonial-auto-rotation">Enable Auto-rotation</Label>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
                <Button 
                  onClick={() => {
                    setEditingSettings(false);
                    setTempSettings(settings);
                  }} 
                  variant="outline"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Transition Delay:</strong> {settings.transition_delay} seconds
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Auto-rotation:</strong> {settings.auto_rotation !== false ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <Button 
                onClick={() => setEditingSettings(true)} 
                variant="outline"
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Testimonial Form */}
      {showAddForm && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800">Add New Testimonial</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="author_name">Author Name</Label>
                <Input
                  id="author_name"
                  value={newTestimonial.author_name}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, author_name: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="author_title">Title/Position</Label>
                <Input
                  id="author_title"
                  value={newTestimonial.author_title}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, author_title: e.target.value })}
                  placeholder="e.g., CEO"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newTestimonial.company}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
                  placeholder="e.g., Acme Corp"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="message">Testimonial Message</Label>
              <textarea
                id="message"
                value={newTestimonial.message}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, message: e.target.value })}
                placeholder="Enter the testimonial message..."
                className="mt-1 w-full min-h-[100px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="star_rating">Star Rating (1-5)</Label>
                <Input
                  id="star_rating"
                  type="number"
                  min="1"
                  max="5"
                  value={newTestimonial.star_rating}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, star_rating: parseInt(e.target.value) || 5 })}
                  className="mt-1"
                />
                <div className="mt-2">{renderStars(newTestimonial.star_rating)}</div>
              </div>
              <div>
                <Label htmlFor="metric_value">Metric Value (optional)</Label>
                <Input
                  id="metric_value"
                  value={newTestimonial.metric_value}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, metric_value: e.target.value })}
                  placeholder="e.g., 40hrs"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="metric_label">Metric Label (optional)</Label>
                <Input
                  id="metric_label"
                  value={newTestimonial.metric_label}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, metric_label: e.target.value })}
                  placeholder="e.g., saved monthly"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="new-active"
                checked={newTestimonial.active}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, active: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="new-active">Active (visible on homepage)</Label>
            </div>

            <div className="flex space-x-3">
              <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Create Testimonial
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testimonials List */}
      <div className="space-y-4">
        {testimonials.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No testimonials found. Add your first testimonial to get started.</p>
            </CardContent>
          </Card>
        ) : (
          testimonials.map((testimonial, index) => (
            <Card key={testimonial.id} className={testimonial.active ? 'border-green-200' : 'border-gray-200 opacity-60'}>
              <CardContent className="pt-6">
                {editingTestimonial?.id === testimonial.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Author Name</Label>
                        <Input
                          value={editingTestimonial.author_name}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, author_name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Title/Position</Label>
                        <Input
                          value={editingTestimonial.author_title}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, author_title: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={editingTestimonial.company}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Testimonial Message</Label>
                      <textarea
                        value={editingTestimonial.message}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, message: e.target.value })}
                        className="mt-1 w-full min-h-[100px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Star Rating (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={editingTestimonial.star_rating}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, star_rating: parseInt(e.target.value) || 5 })}
                          className="mt-1"
                        />
                        <div className="mt-2">{renderStars(editingTestimonial.star_rating)}</div>
                      </div>
                      <div>
                        <Label>Metric Value</Label>
                        <Input
                          value={editingTestimonial.metric_value || ''}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, metric_value: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Metric Label</Label>
                        <Input
                          value={editingTestimonial.metric_label || ''}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, metric_label: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingTestimonial.active}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, active: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label>Active</Label>
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        onClick={() => handleUpdate(testimonial.id, editingTestimonial)} 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button onClick={() => setEditingTestimonial(null)} variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                        {renderStars(testimonial.star_rating)}
                        <Badge variant={testimonial.active ? 'default' : 'secondary'}>
                          {testimonial.active ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                          {testimonial.active ? 'Active' : 'Hidden'}
                        </Badge>
                      </div>
                      <blockquote className="text-gray-700 italic mb-2">&quot;{testimonial.message}&quot;</blockquote>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="font-semibold">{testimonial.author_name}</span>
                        <span>{testimonial.author_title}, {testimonial.company}</span>
                        {testimonial.metric_value && (
                          <span className="text-green-600 font-medium">
                            {testimonial.metric_value} {testimonial.metric_label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        onClick={() => moveTestimonial(testimonial.id, 'up')}
                        disabled={index === 0}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => moveTestimonial(testimonial.id, 'down')}
                        disabled={index === testimonials.length - 1}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setEditingTestimonial({ ...testimonial })}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(testimonial.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TestimonialManager;
