import { ReactNode } from 'react';

interface SectionProps {
  name: string;
  description: string;
  filepath: string;
  actions: Array<{
    name: string;
    function: () => void;
    disabled: boolean;
  }>;
  children: ReactNode;
}

const Section = ({ name, description, filepath, actions, children }: SectionProps) => {
  return (
    <div className="mb-6 bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-2 text-white">{name}</h2>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <p className="text-gray-500 text-xs mb-4 font-mono">{filepath}</p>
      
      {children}
      
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.function}
            disabled={action.disabled}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              action.disabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {action.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Section;
