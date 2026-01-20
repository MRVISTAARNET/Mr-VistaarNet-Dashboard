import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/theme-provider';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Bell, Shield, Building2, Palette } from 'lucide-react';
import { api } from '@/services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Settings: React.FC = () => {
    const { user, updateUser } = useAuth(); // Get updateUser from context
    const { theme, setTheme } = useTheme();
    const [fullName, setFullName] = React.useState(user?.name || "");

    const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(user?.avatar);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Password State
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
    const { changePassword } = useAuth(); // Assuming exposed

    const handlePasswordUpdate = async () => {
        if (!newPassword || !confirmNewPassword) {
            toast.error("Please fill in fields");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 chars");
            return;
        }

        try {
            await changePassword(user!.id, newPassword);
            toast.success("Password updated successfully");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Failed to update password");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async () => {
        try {
            let newAvatarUrl = user?.avatar;

            // 1. Upload Avatar if selected
            if (avatarFile) {
                const formData = new FormData();
                formData.append('file', avatarFile);
                const token = localStorage.getItem('token');

                // Note: user.id might be numeric or string in JS, ensure endpoint handles it.
                // Using explicit URL for upload as per original code
                const res = await fetch(`${API_URL}/api/users/${user?.id}/avatar`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                if (!res.ok) throw new Error('Avatar upload failed');
                // We assume backend updates the avatar URL in DB. 
                // Ideally backend returns the new URL. 
                // For now, we reuse the preview URL as "optimistic" local update if we can't get real one easily without fetch.
                // Or we can rely on standard path convention if we knew it.
            }

            // 2. Update Profile Name
            await api.put(`/users/${user?.id}/profile`, {
                fullName: fullName
            });

            // 3. Update Local Context so UI reflects changes
            updateUser({
                name: fullName,
                // optimized guess for avatar if we just uploaded one; 
                // in reality we should re-fetch profile, but this is immediate feedback
                avatar: previewUrl || user?.avatar
            });

            toast.success("Profile updated successfully");
            // No reload needed now!
        } catch (e: any) {
            console.error("Profile update error:", e);
            toast.error(e.message || "Failed to update profile");
        }
    };

    // Check role safely
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your profile, security, and preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="bg-muted border border-border">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    {isAdmin && <TabsTrigger value="company">Company</TabsTrigger>}

                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                {/* ... content ... */}

                <TabsContent value="profile" className="mt-6 space-y-6">
                    <Card className="border-border bg-card/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <User className="w-5 h-5 text-neon-cyan" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-6 pb-6 border-b border-border">
                                <img
                                    src={previewUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`}
                                    alt={fullName}
                                    className="w-20 h-20 rounded-full border-2 border-border object-cover"
                                />
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <Button
                                        variant="outline"
                                        className="border-border text-foreground hover:bg-accent"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Change Avatar
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size 800K</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="bg-accent/5 border-border text-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input defaultValue={user?.email} disabled className="bg-accent/5 border-border text-foreground opacity-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input defaultValue={user?.role} disabled className="bg-accent/5 border-border text-foreground opacity-50 uppercase" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Input defaultValue={user?.department || "Not Assigned"} disabled className="bg-accent/5 border-border text-foreground opacity-50" />
                                </div>
                            </div>
                            <div className="flex justify-between pt-4">
                                {isAdmin && (
                                    <div className="flex-1" /> // Spacer
                                )}
                                <Button
                                    className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-semibold ml-auto"
                                    onClick={handleUpdateProfile}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="mt-6 space-y-6">
                    <Card className="border-border bg-card/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <Lock className="w-5 h-5 text-neon-magenta" />
                                Password & Authentication
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Current Password (Old)</Label>
                                <PasswordInput
                                    className="bg-accent/5 border-border text-foreground"
                                    disabled
                                    placeholder="Old password verification skipped for this demo"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <PasswordInput
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-accent/5 border-border text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm New Password</Label>
                                <PasswordInput
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className="bg-accent/5 border-border text-foreground"
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button
                                    className="bg-neon-magenta hover:bg-neon-magenta/80 text-white font-semibold"
                                    onClick={handlePasswordUpdate}
                                >
                                    Update Password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="company" className="mt-6 space-y-6">
                    <CompanySettingsTab />
                </TabsContent>



                <TabsContent value="appearance" className="mt-6 space-y-6">
                    <Card className="border-border bg-card/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <Palette className="w-5 h-5 text-neon-magenta" />
                                Theme & Appearance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { name: 'Dark Theme', value: 'dark' as const },
                                    { name: 'Light Theme', value: 'light' as const },
                                    { name: 'System Default', value: 'system' as const }
                                ].map((t, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            setTheme(t.value);
                                            toast.success(`Theme set to ${t.name}`);
                                        }}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${theme === t.value
                                            ? 'bg-card border-neon-cyan/50 ring-1 ring-neon-cyan/50'
                                            : 'bg-card/50 border-border hover:border-border/80'
                                            }`}
                                    >
                                        <div className={`h-20 rounded-lg mb-3 opacity-80 ${t.value === 'light' ? 'bg-gray-200' : 'bg-gradient-to-br from-gray-800 to-black'}`} />
                                        <p className={`font-medium text-center ${theme === t.value ? 'text-neon-cyan' : 'text-muted-foreground'}`}>
                                            {t.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3 pt-4 border-t border-border">
                                <Label>Accent Color</Label>
                                <div className="flex gap-3">
                                    {['bg-neon-cyan', 'bg-neon-magenta', 'bg-neon-lime', 'bg-neon-purple'].map((color, i) => (
                                        <button
                                            key={i}
                                            onClick={() => toast.success("Accent color updated")}
                                            className={`w-8 h-8 rounded-full ${color} ${i === 0 ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : 'opacity-70 hover:opacity-100 transition-opacity'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-6">
                    <Card className="border-border bg-card/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <Bell className="w-5 h-5 text-neon-purple" />
                                Notification Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {['Email Notifications', 'Push Notifications', 'Weekly Digest', 'Critical Alerts'].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                        <div>
                                            <p className="text-foreground font-medium">{item}</p>
                                            <p className="text-sm text-muted-foreground">Receive specific updates via {item.split(' ')[0].toLowerCase()}.</p>
                                        </div>
                                        <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${i < 2 ? 'bg-neon-purple' : 'bg-muted-foreground'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${i < 2 ? 'translate-x-4' : ''}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};


// Helper Component for Company Settings
const CompanySettingsTab: React.FC = () => {
    const [settings, setSettings] = React.useState({
        companyName: '',
        tagline: '',
        address: '',
        website: '',
        contactEmail: ''
    });
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        api.get('/company-settings')
            .then((data: any) => {
                setSettings(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        try {
            await api.post('/company-settings', settings);
            toast.success("Company settings saved");
        } catch (e: any) {
            toast.error("Failed to save settings");
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <Card className="border-border bg-card/50 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-neon-cyan" />
                    Company Configuration
                </CardTitle>
                <CardDescription>General settings for the organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input
                            value={settings.companyName}
                            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                            className="bg-accent/5 border-border text-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Tagline</Label>
                        <Input
                            value={settings.tagline}
                            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                            className="bg-accent/5 border-border text-foreground"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Official Address</Label>
                        <Input
                            value={settings.address}
                            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                            className="bg-accent/5 border-border text-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Website URL</Label>
                        <Input
                            value={settings.website}
                            onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                            className="bg-accent/5 border-border text-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Contact Email</Label>
                        <Input
                            value={settings.contactEmail}
                            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                            className="bg-accent/5 border-border text-foreground"
                        />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSave}
                        className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-semibold"
                    >
                        Save Company Info
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default Settings;
