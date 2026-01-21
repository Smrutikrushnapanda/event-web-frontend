import RegistrationClosedWrapper from "./(users)/Screen/RegistrationClosedWrapper";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <section className="print:hidden">
        <div className="w-full mx-auto">
          <RegistrationClosedWrapper />
        </div>
      </section>
    </div>
  );
}
