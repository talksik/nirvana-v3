export type LogoType = "primary" | "small";

export default function Logo({
  className,
  type,
  grayscale = false,
}: {
  className?: string;
  type?: LogoType;
  grayscale?: boolean;
}) {
  if (type === "small") {
    return (
      <svg
        width="25"
        height="31.75"
        viewBox="0 0 85 107"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} ${grayscale ? "text-black grayscale" : ""}`}
      >
        <path
          d="M0.398438 25.9375C1.84375 26.9531 2.89453 27.6562 3.91016 28.4023C11.9258 34.2617 19.9336 40.125 27.9414 45.9961C32.8008 49.5391 37.1211 53.5898 40.1445 58.8867C42.6094 63.0898 44.1328 67.6172 44.7148 72.4648C44.9258 74.1797 45.0469 75.9062 45.0703 77.6367C45.1055 86.8281 45.0703 96.0156 45.0703 105.207V106.809C44.5742 106.562 44.0938 106.289 43.625 105.992C34.1094 99.043 24.5391 92.1523 15.1055 85.0859C6.83203 78.8672 1.97266 70.5273 0.734375 60.1484C0.527344 58.3633 0.421875 56.5703 0.414062 54.7734C0.398439 46.0312 0.398438 37.2891 0.398438 28.5508V25.9375Z"
          fill="#438E86"
        />
        <path
          d="M84.2539 15.5039V23.0859C84.2539 28.0352 84.2851 32.9844 84.2539 37.9297C84.1875 46.7539 80.4922 53.875 73.6367 59.1641C66.6484 64.5703 59.4023 69.6328 52.2617 74.8477C52.0078 75.0352 51.7422 75.207 51.2695 75.5352C51.164 75.0273 51.0937 74.5117 51.0586 73.9922C51.0586 66.9883 50.9492 59.9805 51.0781 52.9805C51.2382 44.5977 54.539 37.5352 61.0937 32.3828C68.3945 26.6445 76.0117 21.3125 83.4961 15.8125C83.7422 15.6914 83.9961 15.5859 84.2539 15.5039Z"
          fill="#438E86"
        />
        <path
          d="M44.957 44.9219L39.5781 40.9766C36.0156 38.3672 32.4336 35.7812 28.8828 33.1484C23.1992 28.9219 20.3281 23.2539 20.332 16.1367V2.45703C20.332 1.82813 20.332 1.20312 20.332 0.308594C20.8125 0.488281 21.2773 0.707031 21.7188 0.964844C26.6875 4.58203 31.6875 8.16016 36.5898 11.8672C41.1133 15.2852 44 19.7812 44.8516 25.4844C44.9648 26.0469 45.0352 26.6172 45.0625 27.1953C45.082 32.6562 45.0938 38.1172 45.0898 43.5742C45.0898 43.8828 45.0312 44.1914 44.957 44.9219Z"
          fill="#438E86"
        />
      </svg>
    );
  }
  return (
    <svg
      width="233"
      height="162"
      viewBox="0 0 233 162"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${grayscale ? "text-black grayscale" : ""}`}
    >
      <path
        d="M74.3984 26.6133C75.8437 27.6289 76.8945 28.332 77.9102 29.0781C85.9258 34.9375 93.9336 40.8008 101.941 46.6719C106.801 50.2148 111.121 54.2656 114.145 59.5625C116.609 63.7656 118.133 68.293 118.715 73.1406C118.926 74.8555 119.047 76.582 119.07 78.3125C119.105 87.5039 119.07 96.6914 119.07 105.883V107.484C118.574 107.238 118.094 106.965 117.625 106.668C108.109 99.7188 98.5391 92.8281 89.1055 85.7617C80.832 79.543 75.9727 71.2031 74.7344 60.8242C74.5273 59.0391 74.4219 57.2461 74.4141 55.4492C74.3984 46.707 74.3984 37.9648 74.3984 29.2266V26.6133Z"
        fill="#438E86"
      />
      <path
        d="M158.254 16.1797V23.7617C158.254 28.7109 158.285 33.6602 158.254 38.6055C158.188 47.4297 154.492 54.5508 147.637 59.8398C140.649 65.2461 133.402 70.3086 126.262 75.5234C126.008 75.7109 125.742 75.8828 125.27 76.2109C125.164 75.7031 125.094 75.1875 125.059 74.668C125.059 67.6641 124.949 60.6562 125.078 53.6562C125.238 45.2734 128.539 38.2109 135.094 33.0586C142.395 27.3203 150.012 21.9883 157.496 16.4883C157.742 16.3672 157.996 16.2617 158.254 16.1797Z"
        fill="#438E86"
      />
      <path
        d="M118.957 45.5977L113.578 41.6523C110.016 39.043 106.434 36.457 102.883 33.8242C97.1992 29.5977 94.3281 23.9297 94.332 16.8125V3.13281C94.332 2.50391 94.332 1.87891 94.332 0.984375C94.8125 1.16406 95.2774 1.38281 95.7188 1.64062C100.688 5.25781 105.688 8.83594 110.59 12.543C115.113 15.9609 118 20.457 118.852 26.1602C118.965 26.7227 119.035 27.293 119.062 27.8711C119.082 33.332 119.094 38.793 119.09 44.25C119.09 44.5586 119.031 44.8672 118.957 45.5977Z"
        fill="#438E86"
      />
      <path
        d="M11.3774 127.295V132.295C13.522 128.724 16.9478 126.935 21.6587 126.935C25.5532 126.935 28.7095 128.24 31.1274 130.842C33.5415 133.435 34.7524 136.967 34.7524 141.435V161.279H24.4087V142.826C24.4087 140.638 23.8228 138.947 22.6587 137.748C21.5024 136.552 19.9087 135.951 17.8774 135.951C15.854 135.951 14.2681 136.552 13.1118 137.748C11.9556 138.947 11.3774 140.638 11.3774 142.826V161.279H0.955566V127.295H11.3774Z"
        fill="#438E86"
      />
      <path
        d="M67.0403 127.295V133.638C69.4661 129.17 72.7122 126.935 76.7747 126.935V137.529H74.2278C71.8293 137.529 70.0325 138.099 68.8372 139.232C67.6379 140.369 67.0403 142.357 67.0403 145.201V161.279H56.6184V127.295H67.0403Z"
        fill="#438E86"
      />
      <path
        d="M77.8701 127.295H88.9482L96.6826 152.576L104.417 127.295H115.495L103.433 161.279H89.917L77.8701 127.295Z"
        fill="#438E86"
      />
      <path
        d="M138.751 150.513C140.251 149.045 141.001 146.974 141.001 144.295C141.001 141.619 140.251 139.56 138.751 138.123C137.251 136.677 135.524 135.951 133.579 135.951C131.63 135.951 129.907 136.681 128.407 138.138C126.907 139.599 126.157 141.67 126.157 144.357C126.157 147.037 126.907 149.099 128.407 150.545C129.907 151.982 131.63 152.701 133.579 152.701C135.524 152.701 137.251 151.974 138.751 150.513ZM120.048 156.842C117.048 153.592 115.548 149.431 115.548 144.357C115.548 139.287 117.048 135.115 120.048 131.842C123.055 128.572 126.723 126.935 131.048 126.935C135.368 126.935 138.688 128.541 141.001 131.748V127.295H151.423V161.279H141.001V156.342C138.489 159.916 135.118 161.701 130.891 161.701C126.673 161.701 123.055 160.084 120.048 156.842Z"
        fill="#438E86"
      />
      <path
        d="M168.718 127.295V132.295C170.863 128.724 174.289 126.935 179 126.935C182.894 126.935 186.05 128.24 188.468 130.842C190.882 133.435 192.093 136.967 192.093 141.435V161.279H181.75V142.826C181.75 140.638 181.164 138.947 180 137.748C178.843 136.552 177.25 135.951 175.218 135.951C173.195 135.951 171.609 136.552 170.453 137.748C169.296 138.947 168.718 140.638 168.718 142.826V161.279H158.296V127.295H168.718Z"
        fill="#438E86"
      />
      <path
        d="M219.37 150.513C220.87 149.045 221.62 146.974 221.62 144.295C221.62 141.619 220.87 139.56 219.37 138.123C217.87 136.677 216.143 135.951 214.198 135.951C212.249 135.951 210.526 136.681 209.026 138.138C207.526 139.599 206.776 141.67 206.776 144.357C206.776 147.037 207.526 149.099 209.026 150.545C210.526 151.982 212.249 152.701 214.198 152.701C216.143 152.701 217.87 151.974 219.37 150.513ZM200.667 156.842C197.667 153.592 196.167 149.431 196.167 144.357C196.167 139.287 197.667 135.115 200.667 131.842C203.674 128.572 207.342 126.935 211.667 126.935C215.987 126.935 219.307 128.541 221.62 131.748V127.295H232.042V161.279H221.62V156.342C219.108 159.916 215.737 161.701 211.51 161.701C207.292 161.701 203.674 160.084 200.667 156.842Z"
        fill="#438E86"
      />
      <path
        d="M55.172 105.619C56.454 104.173 58.666 104.039 60.1127 105.321C61.5594 106.603 61.6929 108.815 60.4109 110.262L50.5603 121.378C49.2783 122.825 47.0663 122.958 45.6196 121.676C44.1729 120.394 44.0394 118.182 45.3214 116.736L55.172 105.619Z"
        fill="#438E86"
      />
      <path
        d="M40.077 126.98L50 127.002L49.923 160.874L40 160.852L40.077 126.98Z"
        fill="#438E86"
      />
    </svg>
  );
}
