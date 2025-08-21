import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      question: "What are Plant Health Certificates (PHC and PHAC)?",
      answer: "Plant Health Certificate (PHC): Issued by a Biosecurity inspector where arrangements have been made with the local biosecurity office, usually for a fee. It certifies compliance with the importing state's quarantine requirements and is consignment‑based. Plant Health Assurance Certificate (PHAC): Issued by a business accredited under an ICA arrangement. A PHAC has the same legal force as a PHC but is produced by the accredited business rather than the inspector. This allows accredited businesses to self‑certify consignments when they meet the agreed conditions. Both certificates ensure that plants meet specific health requirements for interstate movement, and confirm they are free from specified pests and diseases."
    },
    {
      question: "What is an ICA arrangement?",
      answer: "Interstate Certification Assurance (ICA) is a national accreditation scheme based on quality assurance principles. A business operating under an ICA arrangement can: Follow agreed procedures for managing biosecurity risks, Issue their own Plant Health Assurance Certificates (PHACs) for produce being sent interstate, and Maintain records for auditing by biosecurity authorities. This system reduces the need for every consignment to be inspected directly by government officers."
    },
    {
      question: "How long does it take to get movement certificates?",
      answer: "There is no fixed timeframe. It depends on: The ability of the person moving the plants to arrange treatment, supervision, or inspection with their local biosecurity office before the consignment leaves, and Whether the business already operates under an ICA arrangement (in which case they can issue PHACs directly once the requirements are met). Certificates may sometimes be issued remotely, but it is strongly recommended to plan ahead and contact your local biosecurity authority well before moving plants."
    },
    {
      question: "What happens if I move plants without proper certification?",
      answer: "Moving plants interstate without the required certification is a biosecurity offense. Penalties can include fines, destruction of goods, and potential prosecution. In practice, authorities may sometimes hold plants at the border while attempts are made to resolve the issue with the consignor and the origin state. However, this can delay or jeopardize your consignment and should be avoided. Always obtain the correct documentation before movement."
    },
    {
      question: "Do all plant movements between states require certification?",
      answer: "No. Certification requirements depend on: The type of plant or plant product (the commodity), The origin and destination states, and The presence or absence of particular pests or diseases in those areas. Some low‑risk movements may not require certification, while higher‑risk commodities or origins will need specific treatment, inspection, and certification."
    },
    {
      question: "Why do WA, TAS, and SA have stricter conditions?",
      answer: "Western Australia, Tasmania, and South Australia are geographically isolated from the eastern states. This isolation means they remain free from many serious pests and diseases, such as Queensland fruit fly, which is widespread along the eastern coast where suitable host plants are abundant. To maintain this freedom, these states impose stricter quarantine conditions on incoming plants and plant products."
    },
    {
      question: "What is Area Freedom?",
      answer: "Area Freedom is official recognition that a defined geographic area (a state, region, or zone) is free from a specific pest or disease. If a consignment originates from an area with freedom status for a particular pest, it often does not require treatment or certification for that pest when moved to another state. Area Freedom simplifies plant movement and reduces unnecessary treatments."
    },
    {
      question: "What do terms like \"hosts\" or \"carriers\" mean?",
      answer: "Host: A plant that can be infected by or support the life cycle of a particular pest or disease. For example, citrus trees are hosts for citrus canker. Carrier: A plant, product, or material (like soil or mulch) that can carry or spread a pest even if it is not directly affected. Quarantine rules are based on these categories. If a commodity is listed as a host or carrier of a regulated pest, its interstate movement is restricted unless conditions are met (e.g., treatments, inspections, or certification)."
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