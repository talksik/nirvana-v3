export enum LogoType {
  primary = "primary",
  small = "small",
}

export default function FullMottoLogo({
  className,
  type,
}: {
  className?: string;
  type?: LogoType;
}) {
  if (type === LogoType.small) {
    return (
      <svg
        className={className}
        width="125"
        height="100"
        viewBox="0 0 233 204"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
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
        <path
          d="M48.046 197.234C46.954 197.234 45.9747 197.052 45.108 196.688C44.2413 196.307 43.5567 195.787 43.054 195.128C42.5513 194.452 42.274 193.681 42.222 192.814H44.666C44.7353 193.525 45.0647 194.105 45.654 194.556C46.2607 195.007 47.0493 195.232 48.02 195.232C48.9213 195.232 49.632 195.033 50.152 194.634C50.672 194.235 50.932 193.733 50.932 193.126C50.932 192.502 50.6547 192.043 50.1 191.748C49.5453 191.436 48.6873 191.133 47.526 190.838C46.4687 190.561 45.602 190.283 44.926 190.006C44.2673 189.711 43.6953 189.287 43.21 188.732C42.742 188.16 42.508 187.415 42.508 186.496C42.508 185.768 42.7247 185.101 43.158 184.494C43.5913 183.887 44.2067 183.411 45.004 183.064C45.8013 182.7 46.7113 182.518 47.734 182.518C49.3113 182.518 50.5853 182.917 51.556 183.714C52.5267 184.511 53.0467 185.603 53.116 186.99H50.75C50.698 186.245 50.3947 185.647 49.84 185.196C49.3027 184.745 48.5747 184.52 47.656 184.52C46.8067 184.52 46.1307 184.702 45.628 185.066C45.1253 185.43 44.874 185.907 44.874 186.496C44.874 186.964 45.0213 187.354 45.316 187.666C45.628 187.961 46.0093 188.203 46.46 188.394C46.928 188.567 47.5693 188.767 48.384 188.992C49.4067 189.269 50.2387 189.547 50.88 189.824C51.5213 190.084 52.0673 190.483 52.518 191.02C52.986 191.557 53.2287 192.259 53.246 193.126C53.246 193.906 53.0293 194.608 52.596 195.232C52.1627 195.856 51.5473 196.35 50.75 196.714C49.97 197.061 49.0687 197.234 48.046 197.234Z"
          fill="#CFC7C7"
        />
        <path
          d="M59.472 184.702V193.1C59.472 193.793 59.6193 194.287 59.914 194.582C60.2087 194.859 60.72 194.998 61.448 194.998H63.19V197H61.058C59.7406 197 58.7526 196.697 58.094 196.09C57.4353 195.483 57.106 194.487 57.106 193.1V184.702H55.26V182.752H57.106V179.164H59.472V182.752H63.19V184.702H59.472Z"
          fill="#CFC7C7"
        />
        <path
          d="M65.1727 189.824C65.1727 188.368 65.4674 187.094 66.0567 186.002C66.646 184.893 67.452 184.035 68.4747 183.428C69.5147 182.821 70.6674 182.518 71.9327 182.518C73.1807 182.518 74.264 182.787 75.1827 183.324C76.1014 183.861 76.786 184.537 77.2367 185.352V182.752H79.6287V197H77.2367V194.348C76.7687 195.18 76.0667 195.873 75.1307 196.428C74.212 196.965 73.1374 197.234 71.9067 197.234C70.6414 197.234 69.4974 196.922 68.4747 196.298C67.452 195.674 66.646 194.799 66.0567 193.672C65.4674 192.545 65.1727 191.263 65.1727 189.824ZM77.2367 189.85C77.2367 188.775 77.02 187.839 76.5867 187.042C76.1534 186.245 75.564 185.638 74.8187 185.222C74.0907 184.789 73.2847 184.572 72.4007 184.572C71.5167 184.572 70.7107 184.78 69.9827 185.196C69.2547 185.612 68.674 186.219 68.2407 187.016C67.8074 187.813 67.5907 188.749 67.5907 189.824C67.5907 190.916 67.8074 191.869 68.2407 192.684C68.674 193.481 69.2547 194.097 69.9827 194.53C70.7107 194.946 71.5167 195.154 72.4007 195.154C73.2847 195.154 74.0907 194.946 74.8187 194.53C75.564 194.097 76.1534 193.481 76.5867 192.684C77.02 191.869 77.2367 190.925 77.2367 189.85Z"
          fill="#CFC7C7"
        />
        <path
          d="M95.899 182.752L87.319 203.708H84.875L87.683 196.844L81.937 182.752H84.563L89.035 194.296L93.455 182.752H95.899Z"
          fill="#CFC7C7"
        />
        <path
          d="M112.281 182.492C113.356 182.492 114.326 182.726 115.193 183.194C116.06 183.645 116.736 184.329 117.221 185.248C117.724 186.167 117.975 187.285 117.975 188.602V197H115.635V188.94C115.635 187.519 115.28 186.435 114.569 185.69C113.858 184.927 112.888 184.546 111.657 184.546C110.409 184.546 109.412 184.936 108.667 185.716C107.939 186.496 107.575 187.631 107.575 189.122V197H105.209V177.76H107.575V184.78C108.043 184.052 108.684 183.489 109.499 183.09C110.331 182.691 111.258 182.492 112.281 182.492Z"
          fill="#CFC7C7"
        />
        <path
          d="M134.476 182.752V197H132.11V194.894C131.659 195.622 131.027 196.194 130.212 196.61C129.415 197.009 128.531 197.208 127.56 197.208C126.451 197.208 125.454 196.983 124.57 196.532C123.686 196.064 122.984 195.371 122.464 194.452C121.961 193.533 121.71 192.415 121.71 191.098V182.752H124.05V190.786C124.05 192.19 124.405 193.273 125.116 194.036C125.827 194.781 126.797 195.154 128.028 195.154C129.293 195.154 130.29 194.764 131.018 193.984C131.746 193.204 132.11 192.069 132.11 190.578V182.752H134.476Z"
          fill="#CFC7C7"
        />
        <path
          d="M155.605 182.492C156.714 182.492 157.702 182.726 158.569 183.194C159.435 183.645 160.12 184.329 160.623 185.248C161.125 186.167 161.377 187.285 161.377 188.602V197H159.037V188.94C159.037 187.519 158.681 186.435 157.971 185.69C157.277 184.927 156.333 184.546 155.137 184.546C153.906 184.546 152.927 184.945 152.199 185.742C151.471 186.522 151.107 187.657 151.107 189.148V197H148.767V188.94C148.767 187.519 148.411 186.435 147.701 185.69C147.007 184.927 146.063 184.546 144.867 184.546C143.636 184.546 142.657 184.945 141.929 185.742C141.201 186.522 140.837 187.657 140.837 189.148V197H138.471V182.752H140.837V184.806C141.305 184.061 141.929 183.489 142.709 183.09C143.506 182.691 144.381 182.492 145.335 182.492C146.531 182.492 147.588 182.761 148.507 183.298C149.425 183.835 150.11 184.624 150.561 185.664C150.959 184.659 151.618 183.879 152.537 183.324C153.455 182.769 154.478 182.492 155.605 182.492Z"
          fill="#CFC7C7"
        />
        <path
          d="M164.374 189.824C164.374 188.368 164.669 187.094 165.258 186.002C165.847 184.893 166.653 184.035 167.676 183.428C168.716 182.821 169.869 182.518 171.134 182.518C172.382 182.518 173.465 182.787 174.384 183.324C175.303 183.861 175.987 184.537 176.438 185.352V182.752H178.83V197H176.438V194.348C175.97 195.18 175.268 195.873 174.332 196.428C173.413 196.965 172.339 197.234 171.108 197.234C169.843 197.234 168.699 196.922 167.676 196.298C166.653 195.674 165.847 194.799 165.258 193.672C164.669 192.545 164.374 191.263 164.374 189.824ZM176.438 189.85C176.438 188.775 176.221 187.839 175.788 187.042C175.355 186.245 174.765 185.638 174.02 185.222C173.292 184.789 172.486 184.572 171.602 184.572C170.718 184.572 169.912 184.78 169.184 185.196C168.456 185.612 167.875 186.219 167.442 187.016C167.009 187.813 166.792 188.749 166.792 189.824C166.792 190.916 167.009 191.869 167.442 192.684C167.875 193.481 168.456 194.097 169.184 194.53C169.912 194.946 170.718 195.154 171.602 195.154C172.486 195.154 173.292 194.946 174.02 194.53C174.765 194.097 175.355 193.481 175.788 192.684C176.221 191.869 176.438 190.925 176.438 189.85Z"
          fill="#CFC7C7"
        />
        <path
          d="M189.77 182.492C191.504 182.492 192.908 183.021 193.982 184.078C195.057 185.118 195.594 186.626 195.594 188.602V197H193.254V188.94C193.254 187.519 192.899 186.435 192.188 185.69C191.478 184.927 190.507 184.546 189.276 184.546C188.028 184.546 187.032 184.936 186.286 185.716C185.558 186.496 185.194 187.631 185.194 189.122V197H182.828V182.752H185.194V184.78C185.662 184.052 186.295 183.489 187.092 183.09C187.907 182.691 188.8 182.492 189.77 182.492Z"
          fill="#CFC7C7"
        />
      </svg>
    );
  }
  return (
    <svg
      width="233"
      height="204"
      viewBox="0 0 233 204"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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
      <path
        d="M48.046 197.234C46.954 197.234 45.9747 197.052 45.108 196.688C44.2413 196.307 43.5567 195.787 43.054 195.128C42.5513 194.452 42.274 193.681 42.222 192.814H44.666C44.7353 193.525 45.0647 194.105 45.654 194.556C46.2607 195.007 47.0493 195.232 48.02 195.232C48.9213 195.232 49.632 195.033 50.152 194.634C50.672 194.235 50.932 193.733 50.932 193.126C50.932 192.502 50.6547 192.043 50.1 191.748C49.5453 191.436 48.6873 191.133 47.526 190.838C46.4687 190.561 45.602 190.283 44.926 190.006C44.2673 189.711 43.6953 189.287 43.21 188.732C42.742 188.16 42.508 187.415 42.508 186.496C42.508 185.768 42.7247 185.101 43.158 184.494C43.5913 183.887 44.2067 183.411 45.004 183.064C45.8013 182.7 46.7113 182.518 47.734 182.518C49.3113 182.518 50.5853 182.917 51.556 183.714C52.5267 184.511 53.0467 185.603 53.116 186.99H50.75C50.698 186.245 50.3947 185.647 49.84 185.196C49.3027 184.745 48.5747 184.52 47.656 184.52C46.8067 184.52 46.1307 184.702 45.628 185.066C45.1253 185.43 44.874 185.907 44.874 186.496C44.874 186.964 45.0213 187.354 45.316 187.666C45.628 187.961 46.0093 188.203 46.46 188.394C46.928 188.567 47.5693 188.767 48.384 188.992C49.4067 189.269 50.2387 189.547 50.88 189.824C51.5213 190.084 52.0673 190.483 52.518 191.02C52.986 191.557 53.2287 192.259 53.246 193.126C53.246 193.906 53.0293 194.608 52.596 195.232C52.1627 195.856 51.5473 196.35 50.75 196.714C49.97 197.061 49.0687 197.234 48.046 197.234Z"
        fill="#CFC7C7"
      />
      <path
        d="M59.472 184.702V193.1C59.472 193.793 59.6193 194.287 59.914 194.582C60.2087 194.859 60.72 194.998 61.448 194.998H63.19V197H61.058C59.7406 197 58.7526 196.697 58.094 196.09C57.4353 195.483 57.106 194.487 57.106 193.1V184.702H55.26V182.752H57.106V179.164H59.472V182.752H63.19V184.702H59.472Z"
        fill="#CFC7C7"
      />
      <path
        d="M65.1727 189.824C65.1727 188.368 65.4674 187.094 66.0567 186.002C66.646 184.893 67.452 184.035 68.4747 183.428C69.5147 182.821 70.6674 182.518 71.9327 182.518C73.1807 182.518 74.264 182.787 75.1827 183.324C76.1014 183.861 76.786 184.537 77.2367 185.352V182.752H79.6287V197H77.2367V194.348C76.7687 195.18 76.0667 195.873 75.1307 196.428C74.212 196.965 73.1374 197.234 71.9067 197.234C70.6414 197.234 69.4974 196.922 68.4747 196.298C67.452 195.674 66.646 194.799 66.0567 193.672C65.4674 192.545 65.1727 191.263 65.1727 189.824ZM77.2367 189.85C77.2367 188.775 77.02 187.839 76.5867 187.042C76.1534 186.245 75.564 185.638 74.8187 185.222C74.0907 184.789 73.2847 184.572 72.4007 184.572C71.5167 184.572 70.7107 184.78 69.9827 185.196C69.2547 185.612 68.674 186.219 68.2407 187.016C67.8074 187.813 67.5907 188.749 67.5907 189.824C67.5907 190.916 67.8074 191.869 68.2407 192.684C68.674 193.481 69.2547 194.097 69.9827 194.53C70.7107 194.946 71.5167 195.154 72.4007 195.154C73.2847 195.154 74.0907 194.946 74.8187 194.53C75.564 194.097 76.1534 193.481 76.5867 192.684C77.02 191.869 77.2367 190.925 77.2367 189.85Z"
        fill="#CFC7C7"
      />
      <path
        d="M95.899 182.752L87.319 203.708H84.875L87.683 196.844L81.937 182.752H84.563L89.035 194.296L93.455 182.752H95.899Z"
        fill="#CFC7C7"
      />
      <path
        d="M112.281 182.492C113.356 182.492 114.326 182.726 115.193 183.194C116.06 183.645 116.736 184.329 117.221 185.248C117.724 186.167 117.975 187.285 117.975 188.602V197H115.635V188.94C115.635 187.519 115.28 186.435 114.569 185.69C113.858 184.927 112.888 184.546 111.657 184.546C110.409 184.546 109.412 184.936 108.667 185.716C107.939 186.496 107.575 187.631 107.575 189.122V197H105.209V177.76H107.575V184.78C108.043 184.052 108.684 183.489 109.499 183.09C110.331 182.691 111.258 182.492 112.281 182.492Z"
        fill="#CFC7C7"
      />
      <path
        d="M134.476 182.752V197H132.11V194.894C131.659 195.622 131.027 196.194 130.212 196.61C129.415 197.009 128.531 197.208 127.56 197.208C126.451 197.208 125.454 196.983 124.57 196.532C123.686 196.064 122.984 195.371 122.464 194.452C121.961 193.533 121.71 192.415 121.71 191.098V182.752H124.05V190.786C124.05 192.19 124.405 193.273 125.116 194.036C125.827 194.781 126.797 195.154 128.028 195.154C129.293 195.154 130.29 194.764 131.018 193.984C131.746 193.204 132.11 192.069 132.11 190.578V182.752H134.476Z"
        fill="#CFC7C7"
      />
      <path
        d="M155.605 182.492C156.714 182.492 157.702 182.726 158.569 183.194C159.435 183.645 160.12 184.329 160.623 185.248C161.125 186.167 161.377 187.285 161.377 188.602V197H159.037V188.94C159.037 187.519 158.681 186.435 157.971 185.69C157.277 184.927 156.333 184.546 155.137 184.546C153.906 184.546 152.927 184.945 152.199 185.742C151.471 186.522 151.107 187.657 151.107 189.148V197H148.767V188.94C148.767 187.519 148.411 186.435 147.701 185.69C147.007 184.927 146.063 184.546 144.867 184.546C143.636 184.546 142.657 184.945 141.929 185.742C141.201 186.522 140.837 187.657 140.837 189.148V197H138.471V182.752H140.837V184.806C141.305 184.061 141.929 183.489 142.709 183.09C143.506 182.691 144.381 182.492 145.335 182.492C146.531 182.492 147.588 182.761 148.507 183.298C149.425 183.835 150.11 184.624 150.561 185.664C150.959 184.659 151.618 183.879 152.537 183.324C153.455 182.769 154.478 182.492 155.605 182.492Z"
        fill="#CFC7C7"
      />
      <path
        d="M164.374 189.824C164.374 188.368 164.669 187.094 165.258 186.002C165.847 184.893 166.653 184.035 167.676 183.428C168.716 182.821 169.869 182.518 171.134 182.518C172.382 182.518 173.465 182.787 174.384 183.324C175.303 183.861 175.987 184.537 176.438 185.352V182.752H178.83V197H176.438V194.348C175.97 195.18 175.268 195.873 174.332 196.428C173.413 196.965 172.339 197.234 171.108 197.234C169.843 197.234 168.699 196.922 167.676 196.298C166.653 195.674 165.847 194.799 165.258 193.672C164.669 192.545 164.374 191.263 164.374 189.824ZM176.438 189.85C176.438 188.775 176.221 187.839 175.788 187.042C175.355 186.245 174.765 185.638 174.02 185.222C173.292 184.789 172.486 184.572 171.602 184.572C170.718 184.572 169.912 184.78 169.184 185.196C168.456 185.612 167.875 186.219 167.442 187.016C167.009 187.813 166.792 188.749 166.792 189.824C166.792 190.916 167.009 191.869 167.442 192.684C167.875 193.481 168.456 194.097 169.184 194.53C169.912 194.946 170.718 195.154 171.602 195.154C172.486 195.154 173.292 194.946 174.02 194.53C174.765 194.097 175.355 193.481 175.788 192.684C176.221 191.869 176.438 190.925 176.438 189.85Z"
        fill="#CFC7C7"
      />
      <path
        d="M189.77 182.492C191.504 182.492 192.908 183.021 193.982 184.078C195.057 185.118 195.594 186.626 195.594 188.602V197H193.254V188.94C193.254 187.519 192.899 186.435 192.188 185.69C191.478 184.927 190.507 184.546 189.276 184.546C188.028 184.546 187.032 184.936 186.286 185.716C185.558 186.496 185.194 187.631 185.194 189.122V197H182.828V182.752H185.194V184.78C185.662 184.052 186.295 183.489 187.092 183.09C187.907 182.691 188.8 182.492 189.77 182.492Z"
        fill="#CFC7C7"
      />
    </svg>
  );
}
