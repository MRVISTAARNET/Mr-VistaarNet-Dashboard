import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const { resetPassword, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
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

        if (!token) {
            setError("Invalid or missing reset token");
            return;
        }

        try {
            await resetPassword(token, newPassword);
            setIsSubmitted(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Failed to reset password");
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <Card className="w-full max-w-md border-destructive/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="w-6 h-6" />
                            Invalid Link
                        </CardTitle>
                        <CardDescription>
                            This password reset link is missing the token. Please check the link or request a new one.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link to="/forgot-password">Request New Link</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-xl border-border/50">
                <CardHeader className="space-y-3">
                    <div className="w-full flex justify-center mb-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        {isSubmitted ? "Password Reset!" : "Set New Password"}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {isSubmitted
                            ? "Your password has been successfully updated."
                            : "Please enter your new password below."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSubmitted ? (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-lg w-full justify-center border border-green-200 dark:border-green-900/50">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Success! Redirecting to login...</span>
                            </div>
                            <Button asChild className="w-full">
                                <Link to="/login">Go to Login Now</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20">
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
                                {isLoading ? "Resetting Password..." : "Reset Password"}
                            </Button>
                        </form>
                    )}
                </CardContent>
                {!isSubmitted && (
                    <CardFooter className="flex justify-center border-t bg-muted/20 py-4">
                        <Link
                            to="/login"
                            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
