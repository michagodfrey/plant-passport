import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      question: "What is a Plant Health Assurance Certificate (PHAC)?",
      answer: "A PHAC is an official document that certifies plants meet specific health requirements for interstate movement. It's issued by authorized inspectors after verifying compliance with relevant Import Requirements and ensures the plants are free from specified pests and diseases."
    },
    {
      question: "Why do fire ant carriers need special attention from Queensland?",
      answer: "Red Imported Fire Ants (RIFA) are established in specific areas of Queensland. Items like nursery stock, soil, mulch, and hay can harbor fire ants or their eggs. Stricter controls apply to prevent spread to other states, including specific growing media requirements and movement restrictions."
    },
    {
      question: "How long does it take to get movement certificates?",
      answer: "Processing times vary by state and commodity type. Standard phytosanitary certificates typically take 2-5 business days, while more complex requirements like PHAC can take 5-10 business days. It's recommended to apply well in advance of your planned movement date."
    },
    {
      question: "What happens if I move plants without proper certification?",
      answer: "Moving plants interstate without required certification is a serious biosecurity offense. Penalties can include substantial fines, destruction of non-compliant goods, and potential prosecution. Always ensure you have proper documentation before movement."
    },
    {
      question: "Do all plant movements between states require certification?",
      answer: "Not all plant movements require certification, but many do. Requirements depend on the specific commodity, origin and destination states, and associated pest risks. Some low-risk movements may be exempt, while high-risk pathways require extensive documentation and treatment."
    }
  ];

  return (
    <section id="faqs">
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
    </section>
  );
}