import React from 'react';
import { getTranslation, Language } from '../services/i18n';

interface TranslatedTextProps {
  textKey: string;
  language: Language;
  replacements?: { [key: string]: string };
  as?: React.ElementType;
  className?: string;
  subtitleClassName?: string;
  wrapperClassName?: string;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  textKey,
  language,
  replacements,
  as: Component = 'span',
  className = '',
  subtitleClassName = 'block text-xs font-normal opacity-80 mt-0.5',
  wrapperClassName
}) => {
  const mainText = getTranslation(language, textKey, replacements);
  const showSubtitle = language === 'nah' || language === 'pt-BR';
  const subtitleText = showSubtitle ? `(${getTranslation('es-MX', textKey, replacements)})` : null;

  const content = (
    <>
      {mainText}
      {subtitleText && <span className={subtitleClassName}>{subtitleText}</span>}
    </>
  );

  if (wrapperClassName) {
    return (
        <Component className={wrapperClassName}>
            {content}
        </Component>
    );
  }

  return <Component className={className}>{content}</Component>;
};
