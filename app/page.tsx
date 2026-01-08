import RegistrationForm from '@/components/RegistrationForm';
import RegistrationPage from './(users)/Screen/RegistrationPage';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}

      {/* Main Content - Perfectly Centered Form */}
      <section className="py-12 print:hidden">
        <div className="w-full max-w-4xl mx-auto px-4">
          <RegistrationPage />
        </div>
      </section>

    </div>
  );
}