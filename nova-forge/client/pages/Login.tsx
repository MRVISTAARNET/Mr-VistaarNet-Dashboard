import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Rocket, ShieldCheck, LayoutDashboard } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [requirePasswordChange, setRequirePasswordChange] = useState(false);
    const [tempUser, setTempUser] = useState<any>(null);

    const { login, changePassword, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const userData = await login({ email, password });

            if (userData?.isFirstLogin) {
                setRequirePasswordChange(true);
                setTempUser(userData);
                return;
            }

            if (userData?.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            if (err.message === 'Login failed') {
                setError('Invalid credentials');
            } else if (err.message === 'Failed to fetch') {
                setError('Network Error: Unable to connect to server. Please check your connection or try again later.');
            } else {
                setError(`Connection Error: ${err.message}`);
            }
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            await changePassword(tempUser.id, newPassword);
            if (tempUser?.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (requirePasswordChange) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Set New Password</CardTitle>
                        <CardDescription>Please set a new password for your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <PasswordInput
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <PasswordInput
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Setting Password...' : 'Set Password & Login'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Hero / Visuals (Previously Right) */}
            <div className="hidden lg:flex w-1/2 bg-muted relative overflow-hidden">
                <div className="absolute inset-0 bg-zinc-900" />

                {/* Abstract decorative elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 w-full flex flex-col items-center justify-center p-12 text-center text-white space-y-8">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mb-8 animate-in zoom-in duration-700">
                        <LayoutDashboard className="w-10 h-10 text-white" />
                    </div>

                    <div className="max-w-lg space-y-4">
                        <h2 className="text-4xl font-bold tracking-tight">
                            Mr VistaarNet Dashboard
                        </h2>
                        <p className="text-lg text-zinc-400">
                            Streamline your HR management, attendance tracking, and employee engagement in one unified platform.
                        </p>
                    </div>

                    {/* Feature list or grid */}
                    <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-lg">
                        {[
                            { title: 'Real-time Analytics', icon: '📊' },
                            { title: 'Secure Employee Data', icon: '🔒' },
                            { title: 'Automated Reports', icon: '📈' },
                            { title: 'Easy Leave Mgmt', icon: '🌴' }
                        ].map((feature, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                                <div className="text-2xl mb-2">{feature.icon}</div>
                                <div className="font-semibold text-sm">{feature.title}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form (Previously Left) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
                <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-8 duration-500">
                    <div className="flex flex-col space-y-2 text-center">
                        <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm font-medium border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11 bg-muted/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <PasswordInput
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 bg-muted/30"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link to="#" className="underline underline-offset-4 hover:text-primary">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="#" className="underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>

                {/* Debug Info Footer */}
                <div className="absolute bottom-4 right-4 text-[10px] text-gray-300 opacity-50 font-mono">
                    API: {import.meta.env.VITE_API_URL || 'Default (localhost)'}
                </div>
            </div>
        </div>
    );
}
