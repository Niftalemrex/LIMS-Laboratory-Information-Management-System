import React, { useState } from 'react';
import './ManageBranches.css';

interface Branch {
  id: number;
  name: string;
  location: string;
  phone?: string;
  manager?: string;
}

const initialBranches: Branch[] = [
  { id: 1, name: 'Main Branch', location: 'Addis Ababa', phone: '+251 11 123 4567', manager: 'Kaleb Mesfin' },
  { id: 2, name: 'West Branch', location: 'Bahir Dar', phone: '+251 58 234 5678', manager: 'Tigist Haile' },
  { id: 3, name: 'East Branch', location: 'Dire Dawa', phone: '+251 25 345 6789', manager: 'Amira Yusuf' },
];

const ManageBranches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [newBranch, setNewBranch] = useState<Omit<Branch, 'id'>>({ 
    name: '', 
    location: '', 
    phone: '', 
    manager: '' 
  });
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter branches based on search term
  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (branch.manager && branch.manager.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingBranch) {
      setEditingBranch({ ...editingBranch, [name]: value });
    } else {
      setNewBranch((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddBranch = () => {
    if (!newBranch.name.trim() || !newBranch.location.trim()) return;

    const branch: Branch = {
      id: branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1,
      name: newBranch.name.trim(),
      location: newBranch.location.trim(),
      phone: newBranch.phone?.trim(),
      manager: newBranch.manager?.trim(),
    };

    setBranches([...branches, branch]);
    setNewBranch({ name: '', location: '', phone: '', manager: '' });
    setIsFormOpen(false);
  };

  const handleUpdateBranch = () => {
    if (!editingBranch) return;
    
    setBranches(branches.map(branch => 
      branch.id === editingBranch.id ? editingBranch : branch
    ));
    setEditingBranch(null);
    setIsFormOpen(false);
  };

  const handleDeleteBranch = (id: number) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      setBranches(branches.filter((b) => b.id !== id));
    }
  };

  const startEditing = (branch: Branch) => {
    setEditingBranch(branch);
    setIsFormOpen(true);
  };

  const cancelEdit = () => {
    setEditingBranch(null);
    setNewBranch({ name: '', location: '', phone: '', manager: '' });
    setIsFormOpen(false);
  };

  return (
    <div className="branches-container">
      <div className="branches-header">
        <div className="header-content">
          <h1>
            <i className="icon-building"></i>
            Branch Management
          </h1>
          <p>Manage your organization's branches and locations</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="btn btn-primary"
        >
          <i className="icon-plus"></i>
          Add Branch
        </button>
      </div>

      <div className="branches-content">
        <div className="search-stats-container">
          <div className="search-container">
            <i className="icon-search"></i>
            <input
              type="text"
              placeholder="Search branches by name, location or manager..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="stats-badge">
            <span>{branches.length}</span> branches
          </div>
        </div>

        {/* Add/Edit Form */}
        {isFormOpen && (
          <div className="branch-form-container">
            <div className="form-header">
              <h3>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</h3>
              <button onClick={cancelEdit} className="icon-btn">
                <i className="icon-x"></i>
              </button>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Branch Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter branch name"
                  value={editingBranch ? editingBranch.name : newBranch.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter location"
                  value={editingBranch ? editingBranch.location : newBranch.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={editingBranch ? editingBranch.phone || '' : newBranch.phone || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Manager</label>
                <input
                  type="text"
                  name="manager"
                  placeholder="Enter manager name"
                  value={editingBranch ? editingBranch.manager || '' : newBranch.manager || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button
                onClick={cancelEdit}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={editingBranch ? handleUpdateBranch : handleAddBranch}
                disabled={editingBranch ? !editingBranch.name.trim() : !newBranch.name.trim()}
                className="btn btn-primary"
              >
                {editingBranch ? 'Update Branch' : 'Add Branch'}
              </button>
            </div>
          </div>
        )}

        {/* Branches Table */}
        <div className="table-container">
          <table className="branches-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Location</th>
                <th>Contact</th>
                <th>Manager</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map((branch) => (
                <tr key={branch.id}>
                  <td>
                    <div className="branch-info">
                      <div className="branch-icon">
                        <i className="icon-building"></i>
                      </div>
                      <div>
                        <div className="branch-name">{branch.name}</div>
                        <div className="branch-id">ID: {branch.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="location-info">
                      <i className="icon-map-pin"></i>
                      <span>{branch.location}</span>
                    </div>
                  </td>
                  <td>{branch.phone || '-'}</td>
                  <td>{branch.manager || '-'}</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => startEditing(branch)}
                        className="icon-btn text-indigo"
                        title="Edit"
                      >
                        <i className="icon-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="icon-btn text-red"
                        title="Delete"
                      >
                        <i className="icon-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBranches.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <i className="icon-building"></i>
                      <p className="empty-title">No branches found</p>
                      <p className="empty-description">
                        {searchTerm ? 'Try adjusting your search query' : 'Get started by adding your first branch'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageBranches;