import { Controls, ControlButton } from '@xyflow/react';
import { Settings } from 'lucide-react';
import React from 'react';

interface FlowControlsProps {
  onSettingsClick: () => void;
}

const FlowControls = ({ onSettingsClick }: FlowControlsProps) => {
  return (
    <Controls>
      <ControlButton onClick={onSettingsClick} title="Settings" className="order-first">
        <Settings size={16} />
      </ControlButton>
    </Controls>
  );
};

export default FlowControls;