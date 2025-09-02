import LegalHero from "@/components/LegalHero";
import LegalChat from "@/components/LegalChat";
import DocumentUpload from "@/components/DocumentUpload";
import ConstitutionBrowser from "@/components/ConstitutionBrowser";

const Index = () => {
  return (
    <main className="min-h-screen">
      <LegalHero />
      <LegalChat />
      <DocumentUpload />
      <ConstitutionBrowser />
    </main>
  );
};

export default Index;
