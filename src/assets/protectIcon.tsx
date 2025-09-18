function ProtectIcon(props: { width?: string, height?: string, stroke?: string }) {
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width={props.width || "36"}
        height={props.height || "36"}
        viewBox='0 0 36 36'
        fill='none'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M17.9999 28C17.9999 28 25.9352 25.5361 25.9352 18.7435C25.9352 11.9499 26.2227 11.4196 25.5866 10.7662C24.9495 10.1129 19.0405 8 17.9999 8C16.9594 8 11.0504 10.1129 10.4143 10.7662C9.77717 11.4196 10.0647 11.9499 10.0647 18.7435C10.0647 25.5361 17.9999 28 17.9999 28Z'
          stroke={props.stroke || "#5483D0"}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M15.3115 17.6782L17.2684 19.6881L21.3002 15.5515'
          stroke={props.stroke || "#5483D0"}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <rect
          x='0.5'
          y='0.5'
          width='35'
          height='35'
          rx='17.5'
          stroke={props.stroke || "#5483D0"}
          strokeDasharray='2 2'
        />
      </svg>
    );
  }
  
  export default ProtectIcon;
  