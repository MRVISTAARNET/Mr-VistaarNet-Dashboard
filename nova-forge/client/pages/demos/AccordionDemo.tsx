import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccordionDemo() {
    return (
        <div className="container mx-auto py-10">
            <Card className="w-full max-w-3xl mx-auto border-none shadow-none bg-transparent">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold tracking-tight text-center mb-2">
                        Frequently Asked Questions
                    </CardTitle>
                    <CardDescription className="text-center text-lg text-muted-foreground mb-8">
                        Everything you need to know about the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        <AccordionItem value="item-1" className="bg-card border rounded-lg px-4 shadow-sm">
                            <AccordionTrigger className="text-lg font-medium hover:no-underline">
                                Is it accessible?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Yes. It adheres to the WAI-ARIA design pattern. You can navigate through the items
                                using standard keyboard shortcuts.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="bg-card border rounded-lg px-4 shadow-sm">
                            <AccordionTrigger className="text-lg font-medium hover:no-underline">
                                Is it styled?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Yes. It comes with default styles that matches the other components&apos; aesthetic.
                                The animations are smooth and the design is clean.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="bg-card border rounded-lg px-4 shadow-sm">
                            <AccordionTrigger className="text-lg font-medium hover:no-underline">
                                Is it animated?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Yes. It&apos;s animated by default, but you can disable it if you prefer.
                                The opening and closing actions have a springy, responsive feel.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="bg-card border rounded-lg px-4 shadow-sm">
                            <AccordionTrigger className="text-lg font-medium hover:no-underline">
                                Can I use it for my project?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Absolutely. It is free and open source. You can use it for personal or commercial projects.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
