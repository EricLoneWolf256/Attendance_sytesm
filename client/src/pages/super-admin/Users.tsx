import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsers } from "@/hooks/useUsers";
import { useFaculties } from "@/hooks/useFaculties";
import type { UserRole, User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Search, Plus, Pencil, ShieldCheck, UserX, Loader2, AlertTriangle } from "lucide-react";

export function UserManagement() {
  const { users, isLoading: usersLoading, isError: usersError, createUser, updateUser, toggleStatus } = useUsers();
  const { faculties, isLoading: facultiesLoading } = useFaculties();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null);

  const debouncedSearch = useDebounce(search);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "STUDENT" as UserRole,
    studentNumber: "",
    staffNumber: "",
    facultyId: "f1",
  });

  const roleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN": return "purple" as const;
      case "ADMIN": return "info" as const;
      case "LECTURER": return "success" as const;
      case "STUDENT": return "secondary" as const;
    }
  };

  const statusBadge = (status: string) =>
    status === "ACTIVE" ? <Badge variant="success">Active</Badge> : <Badge variant="destructive">Suspended</Badge>;

  const filteredUsers = useMemo(() => users.filter((user: any) => {
    const matchesSearch =
      debouncedSearch === "" ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (user.studentNumber ?? "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (user.staffNumber ?? "").toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "students" && user.role === "STUDENT") ||
      (activeTab === "lecturers" && user.role === "LECTURER") ||
      (activeTab === "admins" && (user.role === "ADMIN" || user.role === "SUPER_ADMIN"));
    return matchesSearch && matchesTab;
  }), [users, debouncedSearch, activeTab]);

  const counts = useMemo(() => ({
    all: users.length,
    students: users.filter((u: any) => u.role === "STUDENT").length,
    lecturers: users.filter((u: any) => u.role === "LECTURER").length,
    admins: users.filter((u: any) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length,
  }), [users]);

  const getFacultyName = (facultyId: string | null) => {
    if (!facultyId) return "-";
    return faculties.find((f: any) => f.id === facultyId)?.name ?? "-";
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      studentNumber: user.studentNumber ?? "",
      staffNumber: user.staffNumber ?? "",
      facultyId: user.facultyId ?? "f1",
    });
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editUser) return;
    updateUser.mutate(
      {
        id: editUser.id,
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          studentNumber: formData.role === "STUDENT" ? formData.studentNumber : undefined,
          staffNumber: formData.role !== "STUDENT" ? formData.staffNumber : undefined,
          facultyId: formData.facultyId,
        },
      },
      { onSuccess: () => { setEditOpen(false); setEditUser(null); } }
    );
  };

  const openConfirm = (user: User) => {
    setConfirmTarget(user);
    setConfirmOpen(true);
  };

  const handleToggleStatus = () => {
    if (!confirmTarget) return;
    toggleStatus.mutate(
      { id: confirmTarget.id, currentStatus: confirmTarget.status },
      { onSuccess: () => { setConfirmOpen(false); setConfirmTarget(null); } }
    );
  };

  const handleAdd = () => {
    createUser.mutate(
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        studentNumber: formData.role === "STUDENT" ? formData.studentNumber : undefined,
        staffNumber: formData.role !== "STUDENT" ? formData.staffNumber : undefined,
        facultyId: formData.facultyId,
      },
      {
        onSuccess: () => {
          setAddOpen(false);
          setFormData({ firstName: "", lastName: "", email: "", role: "STUDENT", studentNumber: "", staffNumber: "", facultyId: "f1" });
        },
      }
    );
  };

  const isMutating = createUser.isPending || updateUser.isPending || toggleStatus.isPending;

  if (usersError) {
    return (
      <div className="space-y-8">
        <PageHeader title="User Management" subtitle="Manage all system users, roles and statuses" />
        <Card>
          <CardContent className="py-12 text-center text-sm text-red-500">
            Failed to load users. Please try again.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="User Management"
        subtitle="Manage all system users, roles and statuses"
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search users by name, email, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button variant="umu" onClick={() => { setFormData({ firstName: "", lastName: "", email: "", role: "STUDENT", studentNumber: "", staffNumber: "", facultyId: "f1" }); setAddOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />Add User
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-6 pt-6">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="all">All <Badge variant="outline" className="ml-2">{counts.all}</Badge></TabsTrigger>
                <TabsTrigger value="students">Students <Badge variant="outline" className="ml-2">{counts.students}</Badge></TabsTrigger>
                <TabsTrigger value="lecturers">Lecturers <Badge variant="outline" className="ml-2">{counts.lecturers}</Badge></TabsTrigger>
                <TabsTrigger value="admins">Admins <Badge variant="outline" className="ml-2">{counts.admins}</Badge></TabsTrigger>
              </TabsList>
            </div>
            <div className="p-6">
              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Reg/Staff No.</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell><p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p></TableCell>
                          <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                          <TableCell><Badge variant={roleBadgeVariant(user.role)}>{user.role.replace("_", " ")}</Badge></TableCell>
                          <TableCell className="text-sm text-gray-600">{user.studentNumber ?? user.staffNumber ?? "-"}</TableCell>
                          <TableCell className="text-sm text-gray-600">{getFacultyName(user.facultyId)}</TableCell>
                          <TableCell>{statusBadge(user.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openConfirm(user)}>
                                {user.status === "ACTIVE" ? (
                                  <UserX className="h-4 w-4 text-red-500" />
                                ) : (
                                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-sm text-gray-400">No users found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Fill in the details to create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <Input placeholder="First name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input placeholder="Last name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input placeholder="email@umu.ac.ug" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="LECTURER">Lecturer</SelectItem>
                  <SelectItem value="ADMIN">Faculty Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{formData.role === "STUDENT" ? "Registration Number" : "Staff Number"}</label>
              <Input
                placeholder={formData.role === "STUDENT" ? "e.g. 20/U/0001" : "e.g. LEC001"}
                value={formData.role === "STUDENT" ? formData.studentNumber : formData.staffNumber}
                onChange={(e) =>
                  formData.role === "STUDENT"
                    ? setFormData({ ...formData, studentNumber: e.target.value })
                    : setFormData({ ...formData, staffNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Faculty</label>
              <Select value={formData.facultyId} onValueChange={(v) => setFormData({ ...formData, facultyId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {facultiesLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    faculties.map((f: any) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button variant="umu" onClick={handleAdd} disabled={isMutating}>
              {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the user details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="LECTURER">Lecturer</SelectItem>
                  <SelectItem value="ADMIN">Faculty Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Faculty</label>
              <Select value={formData.facultyId} onValueChange={(v) => setFormData({ ...formData, facultyId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {facultiesLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    faculties.map((f: any) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button variant="umu" onClick={handleEdit} disabled={isMutating}>
              {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend/Activate Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm {confirmTarget?.status === "ACTIVE" ? "Suspension" : "Activation"}
            </DialogTitle>
            <DialogDescription>
              {confirmTarget?.status === "ACTIVE"
                ? `Are you sure you want to suspend ${confirmTarget?.firstName} ${confirmTarget?.lastName}? They will not be able to access the system.`
                : `Are you sure you want to reactivate ${confirmTarget?.firstName} ${confirmTarget?.lastName}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button
              variant={confirmTarget?.status === "ACTIVE" ? "destructive" : "umu"}
              onClick={handleToggleStatus}
              disabled={isMutating}
            >
              {toggleStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmTarget?.status === "ACTIVE" ? "Suspend User" : "Activate User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
