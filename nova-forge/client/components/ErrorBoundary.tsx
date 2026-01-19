import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                    <h1 className="text-3xl font-bold mb-4 text-destructive">Something went wrong</h1>
                    <p className="text-muted-foreground mb-6 max-w-md text-center">
                        {this.state.error?.message || JSON.stringify(this.state.error) || "An unexpected error occurred."}
                        {this.state.error?.stack && (
                            <details className="mt-4 text-xs text-left w-full overflow-auto whitespace-pre-wrap bg-muted p-2 rounded">
                                <summary className="cursor-pointer mb-2 font-mono">Stack Trace</summary>
                                {this.state.error.stack}
                            </details>
                        )}
                    </p>
                    <Button onClick={() => window.location.reload()}>Reload Page</Button>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/login';
                        }}
                    >
                        Clear Cache & Logout
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
