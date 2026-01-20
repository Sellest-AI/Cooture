import { I18nextProvider } from 'react-i18next';
import { i18n } from 'translations';

type Props = {
  children?: React.ReactNode;
};

export const I18nProvider = ({ children }: Props) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
