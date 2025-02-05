import { defineSemanticTokens } from '@pandacss/dev';
import { token } from '../../styled-system/tokens';

export const SEMANTIC_OPACITY_TOKENS = defineSemanticTokens.opacity({
  disabled: {
    value: '{opacity.40}',
    type: 'opacity',
  },
  hover: {
    value: '{opacity.80}',
    type: 'opacity',
  },
});
