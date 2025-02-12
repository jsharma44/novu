import styled from '@emotion/styled';
import { colors } from '@novu/design-system';
import { api } from '../../../../api';
import { useEnvController } from '../../../../hooks/useEnvController';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { IForm } from '../../../../pages/templates/components/formTypes';
import { useTemplateEditorForm } from '../../../../pages/templates/components/TemplateEditorFormProvider';
import { useNavigateToStepEditor } from '../../../../pages/templates/hooks/useNavigateToStepEditor';
import { usePreviewSmsTemplate } from '../../../../pages/templates/hooks/usePreviewSmsTemplate';
import { useStepFormPath } from '../../../../pages/templates/hooks/useStepFormPath';
import { useTemplateLocales } from '../../../../pages/templates/hooks/useTemplateLocales';
import { LocaleSelect, MobileSimulator } from '../common';
import { SmsBubble } from './SmsBubble';
import { ErrorPrettyRender } from '../ErrorPrettyRender';

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin: auto 1.25rem 2.5rem 1.25rem;
`;

const LocaleSelectStyled = styled(LocaleSelect)`
  .mantine-Select-input {
    color: ${({ theme }) => (theme.colorScheme === 'dark' ? colors.white : colors.B60)};
  }

  .mantine-Input-rightSection {
    color: ${({ theme }) => (theme.colorScheme === 'dark' ? colors.white : colors.B60)} !important;
  }
`;

export const SmsPreview = ({
  showPreviewAsLoading = false,
  inputVariables,
}: {
  showPreviewAsLoading?: boolean;
  inputVariables?: any;
}) => {
  const { navigateToStepEditor } = useNavigateToStepEditor();
  const { watch, formState } = useFormContext<IForm>();
  const { template } = useTemplateEditorForm();
  const { bridge } = useEnvController({}, template?.bridge);
  const path = useStepFormPath();
  const templateContent = watch(`${path}.template.content`);
  const { pathname } = useLocation();
  const isPreviewPath = pathname.endsWith('/preview');
  const stepId = watch(`${path}.uuid`);
  const [bridgeContent, setBridgeContent] = useState('');

  const {
    mutateAsync,
    isLoading: isBridgeLoading,
    error: previewError,
  } = useMutation((data) => api.post('/v1/echo/preview/' + formState?.defaultValues?.identifier + '/' + stepId, data), {
    onSuccess(data) {
      setBridgeContent(data.outputs.body);
    },
  });

  useEffect(() => {
    if (bridge) {
      mutateAsync(inputVariables);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge, inputVariables]);

  const { selectedLocale, locales, areLocalesLoading, onLocaleChange } = useTemplateLocales({
    content: templateContent as string,
    disabled: showPreviewAsLoading,
  });

  const { isPreviewContentLoading, previewContent, templateError } = usePreviewSmsTemplate(
    selectedLocale,
    showPreviewAsLoading || bridge
  );

  return (
    <MobileSimulator withBackground={false}>
      <BodyContainer>
        <LocaleSelectStyled
          isLoading={areLocalesLoading}
          locales={locales}
          value={selectedLocale}
          onLocaleChange={onLocaleChange}
          dropdownPosition="top"
        />

        {previewError && bridge ? (
          <div style={{ marginTop: 20, padding: 10 }}>
            <ErrorPrettyRender error={previewError} />
          </div>
        ) : (
          <SmsBubble
            onEditClick={navigateToStepEditor}
            isLoading={bridge ? isBridgeLoading : isPreviewContentLoading || areLocalesLoading}
            text={bridge ? bridgeContent : previewContent}
            error={bridge ? undefined : templateError}
            withOverlay={isPreviewPath}
          />
        )}
      </BodyContainer>
    </MobileSimulator>
  );
};
