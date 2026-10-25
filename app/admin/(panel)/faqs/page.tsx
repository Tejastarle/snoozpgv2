"use client";
import { CrudManager } from "@/components/admin/CrudManager";

export default function FaqsPage() {
  return (
    <CrudManager
      table="faqs"
      title="FAQs"
      itemLabel="FAQ"
      description="Questions in the homepage accordion. They're also published as FAQ structured data for Google."
      searchKeys={["question", "answer"]}
      defaults={{ question: "", answer: "", page: "home", is_active: true, sort_order: 0 }}
      fields={[
        { key: "question", label: "Question", type: "text", required: true, full: true },
        { key: "answer", label: "Answer", type: "textarea", required: true },
      ]}
      columns={[
        { key: "question", label: "Question", render: (r) => <span className="font-semibold">{r.question as string}</span> },
        { key: "answer", label: "Answer", render: (r) => <span className="line-clamp-2 max-w-lg text-charcoal/60">{r.answer as string}</span> },
      ]}
    />
  );
}
