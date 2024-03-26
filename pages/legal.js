import React from 'react';
import Link from 'next/link';
import styles from "@/styles/legal.module.css";

const LegalPage = () => {
  return (
    <div>
      <Link href="/" className={styles.homeButton}>
        Home
      </Link>
      <h1>Legal Information</h1>
      <h2>Technologies Used</h2>
      <ul>
        <li><a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React</a></li>
        <li><a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js</a></li>
        <li><a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">Next.js</a></li>
        {/* Voeg hier andere technologieën toe */}
      </ul>
      <h2>Libraries Used</h2>
      <ul>
        <li><a href="https://axios-http.com/" target="_blank" rel="noopener noreferrer">Axios</a></li>
        {/* Voeg hier andere bibliotheken toe */}
      </ul>
      <h2>APIs Used</h2>
      <ul>
        <li>
          <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
            Open-Meteo
            <img className={styles.img} src="https://pbs.twimg.com/profile_images/1591121427893190664/LtkaUCDu_400x400.jpg" alt="Open-Meteo logo" />
          </a>
        </li>
        <li>
          <a href="https://www.ipify.org/" target="_blank" rel="noopener noreferrer">
            Ipify
            <img className={styles.img} src="https://www.ipify.org/static/images/logo.png" alt="Ipify logo" />
          </a>
        </li>
        <li>
          <a href="https://ipapi.co/" target="_blank" rel="noopener noreferrer">
            IPAPI
            <img className={styles.img} src="https://img.stackshare.io/service/11686/icon-64.a33f449690cd.png" alt="IPAPI logo" />
          </a>
        </li>
        <li>
          <a href="https://www.ns.nl/" target="_blank" rel="noopener noreferrer">
            NS API
            <img className={styles.img} src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Nederlandse_Spoorwegen_logo.svg/2560px-Nederlandse_Spoorwegen_logo.svg.png" alt="NS API logo" />
          </a>
        </li>
      </ul>
      {/* <h2>Images and Other Resources</h2> */}
      <ul>
      </ul>
    </div>
  );
};

export default LegalPage;