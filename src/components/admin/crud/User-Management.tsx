'use client';

import React, { useState, useEffect } from 'react';
import { LoadingUI } from '@/components/admin/layout/Loading';
import type { AdminExtendedUser } from '@prisma/client';
import { logger } from "@/lib/logger";
import { 
  listUsers,
  banUser,
  unbanUser,
  removeUser,
  setUserRole,
  useAdminPermissions
} from '@/lib/auth-client';
import type { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  MoreVertical, 
  Shield, 
  ShieldAlert, 
  UserX, 
  Trash2, 
  RefreshCw, 
  CheckCircle,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

// Type moved to @/types/component-types as AdminExtendedUser

export default function AdminUserManagement() {
const [users, setUsers] = useState<AdminExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminExtendedUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const permissions = useAdminPermissions();

  // Load users
  const loadUsers = async (search = '', limit = 10, offset = 0) => {
    try {
      setLoading(true);
      const response = await listUsers({
        search: search ? {
          field: 'email',
          operator: 'contains',
          value: search,
        } : undefined,
        limit,
        offset,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      });

      if (response.error) {
        toast.error(`Failed to load users: ${response.error.message}`);
        return;
      }

      setUsers(response.data?.users ?? []);
      setPagination({
        total: response.data?.total ?? 0,
        limit: response.data?.limit ?? 10,
        offset: response.data?.offset ?? 0,
      });
    } catch (error) {
      toast.error('Failed to load users');
      void logger.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadUsers();
    };
    
    fetchData().catch(error => {
      void logger.error('Error in initial user load:', error);
      toast.error('Failed to load initial user data');
    });
  }, []);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    loadUsers(term, pagination.limit, 0).catch(error => {
      void logger.error('Error in search:', error);
    });
  };

  // Handle pagination
  const handlePagination = (newOffset: number) => {
    loadUsers(searchTerm, pagination.limit, newOffset).catch(error => {
      void logger.error('Error in pagination:', error);
    });
  };

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setActionLoading(`role-${userId}`);
      const response = await setUserRole({
        userId,
        role: newRole,
      });

      if (response.error) {
        toast.error(`Failed to update role: ${response.error.message}`);
        return;
      }

      toast.success(`User role updated to ${newRole}`);
      await loadUsers(searchTerm, pagination.limit, pagination.offset);
    } catch (error) {
      toast.error('Failed to update user role');
      void logger.error('Error updating role:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle ban user
  const handleBanUser = async (userId: string, reason?: string, expiresIn?: number) => {
    try {
      setActionLoading(`ban-${userId}`);
      const response = await banUser({
        userId,
        banReason: reason,
        banExpiresIn: expiresIn,
      });

      if (response.error) {
        toast.error(`Failed to ban user: ${response.error.message}`);
        return;
      }

      toast.success('User banned successfully');
      await loadUsers(searchTerm, pagination.limit, pagination.offset);
    } catch (error) {
      toast.error('Failed to ban user');
      void logger.error('Error banning user:', error);
    } finally {
      setActionLoading(null);
      setSelectedUser(null);
    }
  };

  // Handle unban user
  const handleUnbanUser = async (userId: string) => {
    try {
      setActionLoading(`unban-${userId}`);
      const response = await unbanUser({ userId });

      if (response.error) {
        toast.error(`Failed to unban user: ${response.error.message}`);
        return;
      }

      toast.success('User unbanned successfully');
      await loadUsers(searchTerm, pagination.limit, pagination.offset);
    } catch (error) {
      toast.error('Failed to unban user');
      void logger.error('Error unbanning user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      setActionLoading(`delete-${userId}`);
      const response = await removeUser({ userId });

      if (response.error) {
        toast.error(`Failed to delete user: ${response.error.message}`);
        return;
      }

      toast.success('User deleted successfully');
      await loadUsers(searchTerm, pagination.limit, pagination.offset);
    } catch (error) {
      toast.error('Failed to delete user');
      void logger.error('Error deleting user:', error);
    } finally {
      setActionLoading(null);
      setSelectedUser(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin': return 'destructive';
      case 'admin': return 'default';
      case 'artist': return 'secondary';
      default: return 'outline';
    }
  };

  const canPerformAction = (action: string, user: ExtendedUser) => {
    // Prevent admins from modifying superadmins
    if (user.role === 'superadmin' && action !== 'view') {
      return permissions.canManageRoles;
    }
    
    switch (action) {
      case 'changeRole': return permissions.canManageRoles;
      case 'ban': return permissions.canBanUsers && !user.banned;
      case 'unban': return permissions.canBanUsers && user.banned;
      case 'delete': return permissions.canDeleteUsers;
      default: return true;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              loadUsers(searchTerm, pagination.limit, pagination.offset)
                .catch(error => {
                  void logger.error('Error refreshing data:', error);
                });
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({pagination.total})</CardTitle>
          <CardDescription>
            Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <div className="font-medium">{user.name ?? 'No name'}</div>
                            <div className="text-sm text-muted-foreground">{user.email ?? 'No email'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {user.banned ? (
                            <Badge variant="destructive" className="w-fit">
                              <UserX className="h-3 w-3 mr-1" />
                              Banned
                            </Badge>
                          ) : (
                            <Badge variant="success" className="w-fit">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          {user.emailVerified ? (
                            <Badge variant="outline" className="w-fit text-xs">
                              Email Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="w-fit text-xs">
                              Email Unverified
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {user.createdAt 
                            ? new Date(user.createdAt).toLocaleDateString() 
                            : 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canPerformAction('changeRole', user) && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    void handleRoleChange(user.id, 'user');
                                  }}
                                  disabled={actionLoading === `role-${user.id}` || user.role === 'user'}
                                >
                                  Set as User
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    void handleRoleChange(user.id, 'artist');
                                  }}
                                  disabled={actionLoading === `role-${user.id}` || user.role === 'artist'}
                                >
                                  Set as Artist
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    void handleRoleChange(user.id, 'admin');
                                  }}
                                  disabled={actionLoading === `role-${user.id}` || user.role === 'admin'}
                                >
                                  Set as Admin
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {canPerformAction('ban', user) && (
                              <DropdownMenuItem
                                onClick={() => setSelectedUser(user)}
                                disabled={actionLoading === `ban-${user.id}`}
                              >
                                <ShieldAlert className="h-4 w-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                            )}
                            
                            {canPerformAction('unban', user) && (
                              <DropdownMenuItem
                                onClick={() => {
                                  void handleUnbanUser(user.id);
                                }}
                                disabled={actionLoading === `unban-${user.id}`}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Unban User
                              </DropdownMenuItem>
                            )}
                            
                            {canPerformAction('delete', user) && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setUserToDelete(user.id);
                                  setShowDeleteDialog(true);
                                }}
                                disabled={actionLoading === `delete-${user.id}`}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handlePagination(Math.max(0, pagination.offset - pagination.limit))}
                    disabled={pagination.offset === 0 || loading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {Math.floor(pagination.offset / pagination.limit) + 1} of {Math.ceil(pagination.total / pagination.limit)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePagination(pagination.offset + pagination.limit)}
                    disabled={pagination.offset + pagination.limit >= pagination.total || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Ban User Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban {selectedUser?.email}? This will prevent them from signing in.
            </DialogDescription>
          </DialogHeader>
          
          <BanUserForm
            onSubmit={(reason, expiresIn) => {
              if (selectedUser) {
                void handleBanUser(selectedUser.id, reason, expiresIn);
              }
            }}
            loading={actionLoading === `ban-${selectedUser?.id}`}
          />
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToDelete) {
                  void handleDeleteUser(userToDelete);
                }
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BanUserForm({ 
  onSubmit, 
  loading 
}: { 
  onSubmit: (reason?: string, expiresIn?: number) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('30'); // days

  const handleSubmit = () => {
    const expiresIn = duration ? parseInt(duration) * 24 * 60 * 60 : undefined; // Convert days to seconds
    onSubmit(reason || undefined, expiresIn);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="reason">Ban Reason (Optional)</Label>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for ban..."
        />
      </div>
      
      <div>
        <Label htmlFor="duration">Ban Duration (Days)</Label>
        <Input
          id="duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="30"
          min="1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Leave empty for permanent ban
        </p>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={() => onSubmit()}>
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
          Ban User
        </Button>
      </DialogFooter>
    </div>
  );
}
