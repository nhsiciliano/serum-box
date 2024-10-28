import React from 'react';

interface LogoPlaceholderProps {
  size?: number;
}

const LogoPlaceholder: React.FC<LogoPlaceholderProps> = ({ size = 32 }) => {
  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: '#4A5568', 
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: size / 2,
        fontWeight: 'bold'
      }}
    >
      SB
    </div>
  );
};

export default LogoPlaceholder;
