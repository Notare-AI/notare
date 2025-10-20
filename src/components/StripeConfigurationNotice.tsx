import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StripeConfigurationNotice = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#212121] text-white">
      <div className="max-w-2xl p-8 rounded-lg bg-[#2A2A2A] border border-gray-700 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Stripe Is Not Configured</h1>
        <p className="text-gray-400 mb-6">
          To enable checkout, you need to add your Stripe product Price IDs to your project's configuration.
        </p>
        <p className="text-gray-300">
          Please follow the instructions in the <code className="bg-gray-700 px-1 py-0.5 rounded-sm">MULTI_PLAN_CHECKOUT_SETUP.md</code> file in your project's root directory.
        </p>
        <div className="mt-6">
          <Link to="/dashboard" className="text-purple-400 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StripeConfigurationNotice;