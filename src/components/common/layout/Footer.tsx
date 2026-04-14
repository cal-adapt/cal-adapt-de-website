import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import {
  isNavGroup,
  type NavGroup,
  navGroups,
  type NavItem,
  type NavLink,
  navLinks,
} from "@/data/navigation";

import styles from "./Footer.module.scss";

const footerNavConfig: NavItem[] = [
  navGroups.tools,
  navLinks.fourthAssessment,
  navLinks.guidance,
  navLinks.contact,
];

function FooterNavLink({ link }: { link: NavLink }) {
  return (
    <li key={link.id}>
      <Link className={styles.navLink} href={link.href} aria-label={link.label}>
        {link.label}
      </Link>
    </li>
  );
}

function FooterNavGroup({ group }: { group: NavGroup }) {
  return (
    <li className={styles.navGroup}>
      <span className={styles.groupTitle}>{group.label}</span>
      <ul className={styles.groupList}>
        {group.links.map((link) => (
          <FooterNavLink key={link.id} link={link} />
        ))}
      </ul>
    </li>
  );
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <p>
          Cal-Adapt was developed by Eagle Rock Analytics and the Geospatial Innovation Facility at
          the University of California, Berkeley, with support from the Lawrence Berkeley National
          Lab. The California Energy Commission provided funding and advisory oversight.
        </p>
        <div className={styles.logos}>
          <Icon variant="logoERA" aria-label="Eagle Rock Analytics" />
          <Icon variant="logoGIF" aria-label="Geospatial Innovation Facility" />
          <Icon variant="logoLBNL" aria-label="Lawrence Berkeley National Lab" />
          <Icon variant="logoCEC" aria-label="California Energy Commission" />
        </div>
      </div>
      <div className={styles.right}>
        <nav className={styles.nav} aria-label="Footer navigation">
          <ul className={styles.navList}>
            {footerNavConfig.map((item) =>
              isNavGroup(item) ? (
                <FooterNavGroup key={item.id} group={item} />
              ) : (
                <FooterNavLink key={item.id} link={item} />
              )
            )}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
