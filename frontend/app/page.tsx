import { Spellbook } from "@/components/Spellbook";
import { Calculator } from "@/components/Calculator";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 font-sans">
      <Spellbook title="Pet Stats Calculator">
        <Calculator />
      </Spellbook>
    </main>
  );
}
