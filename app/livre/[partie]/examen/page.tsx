import { ExamScreen } from "@/components/exam-screen";

export default async function Page({ params }: { params: Promise<{ partie: string }> }) {
  const { partie } = await params;
  return <ExamScreen code={partie} />;
}
