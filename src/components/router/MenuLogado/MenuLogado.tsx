import {
  IconAdjustments,
  IconCalendarStats,
  IconFileAnalytics,
  IconGauge,
  IconHelpCircle,
  IconLock,
  IconMapPin,
  IconNotes,
  IconPresentationAnalytics,
  IconSettings,
  IconUpload,
  IconUserCog,
  IconUsersGroup,
} from '@tabler/icons-react';
import { Code, Group, ScrollArea } from '@mantine/core';
import { LinksGroup } from './NavbarLinksGroup/NavbarLinksGroup';
import { UserButton } from './UserButton/UserButton';
import classes from './MenuLogado.module.css';
import { BiTransfer } from 'react-icons/bi';

const mockdata = [
  {
    label: 'Upload',
    icon: IconUpload,
    links: [
      {
        icon: IconUpload,
        label: 'Envie um arquivo de promoção',
        description: 'Upload de arquivos de promoções do Diário Oficial',
        link: '/upload_promocao',
      },
    ],
  },
  {
    label: 'Configurações',
    icon: IconAdjustments,
    links: [
      {
        icon: IconSettings,
        label: 'Configuração de Salários',
        description: 'Gerencie as tabelas salariais',
        link: '/config_salarios',
      },
      {
        icon: IconMapPin,
        label: 'Áreas de Atuação',
        description: 'Atualize as áreas de atuação',
        link: '/areas_atuacao',
      },
      {
        icon: IconUsersGroup,
        label: 'Equipe de Funcionários',
        description: 'Gerencie os funcionários do escritório',
        link: '/funcionarios',
      },
      {
        icon: IconHelpCircle,
        label: 'Perguntas Frequentes',
        description: 'Gerencie as perguntas frequentes',
        link: '/perguntas_frequentes',
      },
    ],
  },
  {
    label: 'Promoções',
    icon: IconAdjustments,
    links: [
      {
        icon: BiTransfer,
        label: 'Lista de Promoções',
        description: 'Visualize as promoções cadastradas',
        link: '/lista_promocoes',
      },
    ],
  },
];

export function MenuLogado() {
  const links = mockdata.map((item) => <LinksGroup {...item} key={item.label} />);

  return (
    <nav>
      <ScrollArea>
        <div>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton />
      </div>
    </nav>
  );
}
