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
  RotateCw
} from 'lucide-react';

export const CarouselManager = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSlide, setEditingSlide] = useState(null);
  const [newSlide, setNewSlide] = useState({ title: '', subtitle: '', order_index: 0, active: true });
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({ transition_delay: 5, auto_rotation: true });
  const [editingSettings, setEditingSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState({ transition_delay: 5, auto_rotation: true });

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/carousel/slides`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSlides(response.data.slides || []);
    } catch (error) {
      setError('Failed to load carousel slides');
      console.error('Error loading slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Set order_index to be the next available index
      const maxOrderIndex = Math.max(...slides.map(s => s.order_index), -1);
      const slideData = {
        ...newSlide,
        order_index: maxOrderIndex + 1
      };
      
      await axios.post(`${API_URL}/api/carousel/slides`, slideData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewSlide({ title: '', subtitle: '', order_index: 0, active: true });
      setShowAddForm(false);
      loadSlides();
    } catch (error) {
      setError('Failed to create slide');
      console.error('Error creating slide:', error);
    }
  };

  const handleUpdate = async (slideId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/carousel/slides/${slideId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEditingSlide(null);
      loadSlides();
    } catch (error) {
      setError('Failed to update slide');
      console.error('Error updating slide:', error);
    }
  };

  const handleDelete = async (slideId) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/carousel/slides/${slideId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      loadSlides();
    } catch (error) {
      setError('Failed to delete slide');
      console.error('Error deleting slide:', error);
    }
  };

  const moveSlide = (slideId, direction) => {
    const slideIndex = slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    // Swap the slides
    [newSlides[slideIndex], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[slideIndex]];
    
    // Update order_index values
    newSlides.forEach((slide, index) => {
      slide.order_index = index;
    });
    
    setSlides(newSlides);
    
    // Update in backend
    newSlides.forEach(async (slide) => {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/api/carousel/slides/${slide.id}`, 
          { order_index: slide.order_index }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error updating slide order:', error);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RotateCw className="h-6 w-6 animate-spin mr-2" />
        Loading carousel slides...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hero Carousel Management</h2>
          <p className="text-gray-600">Manage the rotating messages on the homepage hero section</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Add New Slide Form */}
      {showAddForm && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800">Add New Carousel Slide</CardTitle>
            <CardDescription>Create a new slide for the homepage hero section</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-title">Title</Label>
                <Input
                  id="new-title"
                  value={newSlide.title}
                  onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                  placeholder="Enter slide title..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="new-subtitle">Subtitle</Label>
                <textarea
                  id="new-subtitle"
                  value={newSlide.subtitle}
                  onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                  placeholder="Enter slide description..."
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="new-active"
                  checked={newSlide.active}
                  onChange={(e) => setNewSlide({ ...newSlide, active: e.target.checked })}
                  className="h-4 w-4 text-blue-600"
                />
                <Label htmlFor="new-active">Active</Label>
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Create Slide
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Slides List */}
      <div className="space-y-4">
        {slides.map((slide, index) => (
          <Card key={slide.id} className={`${!slide.active ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              {editingSlide === slide.id ? (
                <EditSlideForm 
                  slide={slide} 
                  onSave={(updatedData) => handleUpdate(slide.id, updatedData)}
                  onCancel={() => setEditingSlide(null)}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Slide {slide.order_index + 1}
                      </Badge>
                      <Badge variant={slide.active ? "default" : "secondary"}>
                        {slide.active ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{slide.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{slide.subtitle}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="flex flex-col space-y-1">
                      <Button
                        onClick={() => moveSlide(slide.id, 'up')}
                        disabled={index === 0}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => moveSlide(slide.id, 'down')}
                        disabled={index === slides.length - 1}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoveDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => setEditingSlide(slide.id)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(slide.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {slides.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No carousel slides found. Add your first slide to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const EditSlideForm = ({ slide, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: slide.title,
    subtitle: slide.subtitle,
    active: slide.active
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="edit-subtitle">Subtitle</Label>
        <textarea
          id="edit-subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          rows={3}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="edit-active"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          className="h-4 w-4 text-blue-600"
        />
        <Label htmlFor="edit-active">Active</Label>
      </div>
      <div className="flex space-x-3">
        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
        <Button onClick={onCancel} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};