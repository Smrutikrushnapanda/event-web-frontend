import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:px-6">
        <div className="border-t pt-8">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Event Portal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
