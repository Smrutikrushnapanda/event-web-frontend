import RegistrationForm from '@/components/RegistrationForm';
import RegistrationPage from './(users)/Screen/RegistrationPage';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}

      {/* Main Content - Perfectly Centered Form */}
      <section className=" print:hidden">
        <div className="w-full  mx-auto">
          <RegistrationPage />
        </div>
      </section>

    </div>
  );
}