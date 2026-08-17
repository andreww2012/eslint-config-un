// cspell:ignore spinbutton treegrid menuitemradio menuitemcheckbox
import type {UnConfigContext} from '../config-un/shared';
import {ERROR, GLOB_JSX_TSX, OFF, WARNING} from '../constants';
import type {OmitIndexSignature, OmitStrict} from '../types';
import {type MaybeFn, getKeysOfTruthyValues, maybeCall} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

const DEFAULT_AMBIGUOUS_WORDS = ['click here', 'here', 'link', 'a link', 'learn more'];

interface WordsListAndOptionalSeverity {
  /**
   * The words themselves
   */
  words: string[];

  /**
   * The severity the affected rule is reported with
   */
  severity?: 'error' | 'warn';
}

type AltTextCheckDefaultElements = keyof OmitStrict<
  OmitIndexSignature<GetRuleOptions<'jsx-a11y', 'alt-text'>>,
  'elements'
>;
const altTextCheckDefaultElements: Record<AltTextCheckDefaultElements, true> = {
  img: true,
  object: true,
  area: true,
  'input[type="image"]': true,
};

type AnchorIsValidAspectsToCheck = (GetRuleOptions<
  'jsx-a11y',
  'anchor-is-valid'
>['aspects'] & {})[number];
const anchorIsValidDefaultAspectsToCheck: Partial<Record<AnchorIsValidAspectsToCheck, true>> = {
  noHref: true,
  invalidHref: true,
};

type PossibleTabbableRoles = (GetRuleOptions<
  'jsx-a11y',
  'interactive-supports-focus'
>['tabbable'] & {})[number];
// From `recommended` config
const defaultTabbableRoles: Partial<Record<PossibleTabbableRoles, true>> = {
  button: true,
  checkbox: true,
  link: true,
  searchbox: true,
  spinbutton: true,
  switch: true,
  textbox: true,
};

const defaultHoverInHandlersRequiringOnFocus: Record<`on${string}`, true> = {
  onMouseOver: true,
  onMouseEnter: true,
  onPointerOver: true,
  onPointerEnter: true,
};

const defaultHoverOutHandlersRequiringOnBlur: Record<`on${string}`, true> = {
  onMouseOut: true,
  onMouseLeave: true,
  onPointerOut: true,
  onPointerLeave: true,
};

/**
 * Provides accessibility rules for JSX.
 * Applied to all JSX files by default.
 *
 * Note: you may want to disable this config if you're not using JSX for performance reasons.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]sx</code>
 */
export interface JsxA11yEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'jsx-a11y'> {
  /**
   * [`eslint-plugin-jsx-a11y-x`](https://npmx.dev/eslint-plugin-jsx-a11y-x) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `jsx-a11y-x` property and applied to the resolved `files` and
   * `ignores` of this config.
   */
  settings?: {
    /**
     * Custom names of the standard HTML attributes
     */
    attributes?: {
      /**
       * Attribute names to treat as the `for` attribute of a `<label>`
       */
      for?: string[];
    };

    /**
     * Keys are custom component names that render an HTML element specified in the value.
     */
    components?: Record<string, string>;

    /**
     * "Defines the prop your code uses to create polymorphic components.
     * This setting will be used determine the element type in rules that require semantic context.
     * To restrict polymorphic linting to specified components, additionally set
     * `polymorphicAllowList` to an array of component names." -
     * [plugin docs](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y#polymorphic-components).
     */
    polymorphicPropName?: string;

    /**
     * See `polymorphicPropName` docs.
     */
    polymorphicAllowList?: string[];
  };

  /**
   * Elements to check for `alt` attribute on by
   * [`jsx-a11y/alt-text`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/alt-text.md)
   * rule.
   *
   * By default, `<img>`, `<area>`, `<input type="image">`, and `<object>` elements are checked.
   * Using the object syntax, you can disable the default checks or specify additional elements.
   * Setting to `false` will disable the rule.
   */
  altTextCheckForElements?:
    false | Partial<Record<AltTextCheckDefaultElements | (string & {}), boolean>>;

  /**
   * Anchor aspects to check by
   * [`jsx-a11y/anchor-is-valid`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/anchor-is-valid.md)
   * rule.
   *
   * By default, `noHref` and `invalidHref` aspects are checked.
   * Using the object syntax, you can disable the default checks or specify additional aspects.
   * Setting to `false` will disable the rule.
   */
  anchorIsValidCheckedAspects?: false | Partial<Record<AnchorIsValidAspectsToCheck, boolean>>;

  /**
   * List of words that will be considered ambiguous and will be flagged by
   * [`jsx-a11y/anchor-ambiguous-text`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/anchor-ambiguous-text.md)
   * rule.
   *
   * Can be either an array or a function to which the default words will be passed as the only
   * argument.
   * Setting to `false` will disable the rule.
   *
   * Default rule severity is `warn` and the list of words is the same as listed in the rule docs.
   */
  ambiguousWordsForAnchorText?: MaybeFn<
    false | WordsListAndOptionalSeverity,
    [defaultWords: string[]]
  >;

  /**
   * List of handlers that must be accompanied with `onFocus` handler.
   *
   * The default list is `['onMouseOver', 'onMouseEnter', 'onPointerOver', 'onPointerEnter']`.
   *
   * Using the object syntax, you can disable the default handlers or specify additional ones.
   * Setting to `false` will disable the rule.
   */
  hoverInHandlersRequiringOnFocus?: Record<`on${string}`, boolean>;

  /**
   * List of handlers that must be accompanied with `onBlur` handler.
   *
   * The default list is `['onMouseOut', 'onMouseLeave', 'onPointerOut', 'onPointerLeave']`.
   *
   * Using the object syntax, you can disable the default handlers or specify additional ones.
   * Setting to `false` will disable the rule.
   */
  hoverOutHandlersRequiringOnBlur?: Record<`on${string}`, boolean>;

  /**
   * List of words like "image", "picture" or "photo" that will be flagged by
   * [`jsx-a11y/img-redundant-alt`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/img-redundant-alt.md)
   * rule. if contained in the image alt text.
   *
   * Will be merged with the default words listed in the rule docs, and this behavior cannot be
   * changed.
   * Setting to `false` will disable the rule.
   *
   * Default rule severity is `warn`.
   */
  imageWords?: false | WordsListAndOptionalSeverity;

  /**
   * "A list of attributes to check on the label component and its children for a label.
   * Use this if you have a custom component that uses a string passed on a prop to render an HTML
   * label, for example." - plugin docs.
   *
   * Will be merged with the built-ins `['alt', 'aria-label', 'aria-labelledby']`.
   *
   * Affected rules:
   * - [`jsx-a11y/control-has-associated-label`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/control-has-associated-label.md)
   * - [`jsx-a11y/label-has-associated-control`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/label-has-associated-control.md)
   */
  labelAttributes?: string[];

  /**
   * The list of roles that will be checked by
   * [`jsx-a11y/interactive-supports-focus`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/interactive-supports-focus.md)
   * rule.
   *
   * The default list of roles is
   * `['button', 'checkbox', 'link', 'searchbox', 'spinbutton', 'switch', 'textbox']`.
   *
   * Using the object syntax, you can disable the default roles or specify additional ones.
   * Setting to `false` will disable the rule.
   */
  tabbableRoles?: false | Partial<Record<PossibleTabbableRoles, boolean>>;

  /**
   * Various custom components that will be checked by various rules.
   */
  customComponents?: {
    /**
     * List of components that render an `<area>` element.
     *
     * Affected rule:
     * - [`jsx-a11y/alt-text`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/alt-text.md)
     */
    areaElements?: string[];

    /**
     * List of components that render an `<audio>` element.
     *
     * Affected rule:
     * - [`jsx-a11y/media-has-caption`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/media-has-caption.md)
     */
    audioElements?: string[];

    /**
     * List of components that render a control (an interactive element).
     *
     * Affected rules:
     * - [`jsx-a11y/control-has-associated-label`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/control-has-associated-label.md)
     * - [`jsx-a11y/label-has-associated-control`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/label-has-associated-control.md)
     */
    controls?: string[];

    /**
     * List of components that render a heading (`<h1>`, `<h2>`, etc.).
     *
     * Affected rule:
     * - [`jsx-a11y/heading-has-content`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/heading-has-content.md)
     */
    headings?: string[];

    /**
     * List of components that render an `<img>` element.
     *
     * Affected rules:
     * - [`jsx-a11y/alt-text`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/alt-text.md)
     * - [`jsx-a11y/img-redundant-alt`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/img-redundant-alt.md)
     */
    imgElements?: string[];

    /**
     * List of components that render an `<input>` element with `type="image"`.
     *
     * Affected rule:
     * - [`jsx-a11y/alt-text`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/alt-text.md)
     */
    inputTypeImageElements?: string[];

    /**
     * List of components that render an `<input>` element which accepts text input.
     *
     * Affected rule:
     * - [`jsx-a11y/autocomplete-valid`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/autocomplete-valid.md)
     */
    inputs?: string[];

    /**
     * List of components that render a `<label>` element.
     *
     * Affected rule:
     * - [`jsx-a11y/label-has-associated-control`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/label-has-associated-control.md)
     */
    labels?: string[];

    /**
     * List of components that render a link.
     *
     * Affected rules:
     * - [`jsx-a11y/anchor-is-valid`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/anchor-is-valid.md)
     * - [`jsx-a11y/anchor-has-content`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/anchor-has-content.md)
     */
    links?: string[];

    /**
     * List of components that render an `<object>` element.
     *
     * Affected rule:
     * - [`jsx-a11y/alt-text`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/alt-text.md)
     */
    objectElements?: string[];

    /**
     * List of components that render a `<track>` element.
     *
     * Affected rule:
     * - [`jsx-a11y/media-has-caption`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/media-has-caption.md)
     */
    trackElements?: string[];

    /**
     * List of components that render a `<video>` element.
     *
     * Affected rule:
     * - [`jsx-a11y/media-has-caption`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/media-has-caption.md)
     */
    videoElements?: string[];
  };
}

/**
 * The `astro` and `lit` Configs reuse these rules under their own plugin prefix, so the builder is
 * exposed separately from the Config's own `setup`
 */
export const buildJsxA11yConfigs = <ExtraPlugins extends ExtraPluginsType>(
  context: Readonly<UnConfigContext<ExtraPlugins>>,
  optionsRawFromParameters:
    | boolean
    | OmitStrict<JsxA11yEslintConfigOptions<ExtraPlugins>, 'overrides' | 'overridesAny'>
    | undefined,
  customConfig?: {
    prefix: 'astro' | 'lit';
    options: JsxA11yEslintConfigOptions & UnFlatConfigEntryBase;
  },
) => {
  const optionsRaw =
    customConfig?.options ?? optionsRawFromParameters ?? context.rootOptions.configs?.jsxA11y;
  const optionsResolved = assignDefaults(optionsRaw, {
    ambiguousWordsForAnchorText: {
      words: DEFAULT_AMBIGUOUS_WORDS,
    },
    customComponents: {},
  });

  const {
    settings: pluginSettings,
    altTextCheckForElements,
    anchorIsValidCheckedAspects,
    ambiguousWordsForAnchorText,
    imageWords,
    hoverInHandlersRequiringOnFocus,
    hoverOutHandlersRequiringOnBlur,
    labelAttributes,
    tabbableRoles,
    customComponents,
  } = optionsResolved;

  const ambiguousWords = maybeCall(ambiguousWordsForAnchorText, DEFAULT_AMBIGUOUS_WORDS);
  const anchorIsValidFinalCheckedAspects = getKeysOfTruthyValues(
    {
      ...anchorIsValidDefaultAspectsToCheck,
      ...anchorIsValidCheckedAspects,
    },
    'nonEmptyArray',
  );

  const prefix = customConfig?.prefix;
  const prefixFinal = (prefix === 'lit' ? 'lit-a11y' : prefix) ?? 'jsx-a11y';
  const isForAstro = prefixFinal === 'astro';
  const isForLit = prefix === 'lit';

  // `rn` means "rule name"
  const rn = <T extends string>(ruleName: T) =>
    `${isForAstro ? 'jsx-a11y/' : ''}${ruleName}` as const;

  const setRuleOptions = <Options extends readonly unknown[]>(options: Options): Options | [] =>
    isForAstro ? [] : options;

  const configBuilder = context.createConfigBuilder(optionsResolved, prefixFinal);

  // Legend:
  // 🔴 - NOT in recommended

  configBuilder
    ?.addConfig([
      prefixFinal.includes('a11y') ? prefixFinal : `jsx-a11y/${prefixFinal}`,
      {
        filesDefault: [GLOB_JSX_TSX],
        // Direct spreading settings object for `lit-a11y` is not a mistake: https://github.com/open-wc/open-wc/blob/5aeaf35e01a2f15b6663d71102eeea3333e4c57d/packages/eslint-plugin-lit-a11y/lib/utils/HasLitHtmlImportRuleExtension.js#L122
        settings: {
          [isForLit ? '' : 'jsx-a11y-x']: pluginSettings,
        },
      },
    ])
    .addRule('accessible-name', isForLit ? ERROR : null)
    .addRule(
      rn('alt-text'),
      altTextCheckForElements === false ? OFF : ERROR,
      isForLit
        ? []
        : setRuleOptions([
            {
              elements: getKeysOfTruthyValues({
                ...altTextCheckDefaultElements,
                ...altTextCheckForElements,
              }),
              ...(customComponents.imgElements?.length && {img: customComponents.imgElements}),
              ...(customComponents.objectElements?.length && {
                object: customComponents.objectElements,
              }),
              ...(customComponents.areaElements?.length && {area: customComponents.areaElements}),
              ...(customComponents.inputTypeImageElements?.length && {
                'input[type="image"]': customComponents.inputTypeImageElements,
              }),
            },
          ]),
    ) /** @since 5.0.0 */
    .addRule(
      rn('anchor-ambiguous-text'),
      isForLit
        ? null
        : ambiguousWords === false
          ? OFF
          : ambiguousWords.severity === 'error'
            ? ERROR
            : WARNING,
      setRuleOptions([
        {
          ...(ambiguousWords && ambiguousWords.words.length > 0 && {words: ambiguousWords.words}),
        },
      ]),
    ) /** @since 6.7.0 */ // 🔴
    .addRule(
      rn('anchor-has-content'),
      isForLit ? null : ERROR,
      setRuleOptions([
        {
          ...(customComponents.links?.length && {components: customComponents.links}),
        },
      ]),
    ) /** @since 2.1.0 */
    .addRule(
      rn('anchor-is-valid'),
      anchorIsValidCheckedAspects === false || anchorIsValidFinalCheckedAspects == null
        ? OFF
        : ERROR,
      setRuleOptions([
        {
          ...(customComponents.links?.length && {components: customComponents.links}),
          aspects: anchorIsValidFinalCheckedAspects,
        },
      ]),
    ) /** @since 5.1.1 */
    .addRule(rn('aria-activedescendant-has-tabindex'), ERROR) /** @since 4.0.0 */
    .addRule('aria-attr-valid-value', isForLit ? ERROR : null)
    .addRule('aria-attrs', isForLit ? ERROR : null)
    .addRule(rn('aria-props'), isForLit ? null : ERROR) /** @since 1.0.0 */
    .addRule(rn('aria-proptypes'), isForLit ? null : ERROR) /** @since 1.0.0 */
    .addRule(rn('aria-role'), ERROR) /** @since 1.0.0 */
    .addRule(rn('aria-unsupported-elements'), ERROR) /** @since 1.0.0 */
    .addRule(
      rn('autocomplete-valid'),
      ERROR,
      isForLit
        ? []
        : setRuleOptions([
            {
              ...(customComponents.inputs?.length && {inputComponents: customComponents.inputs}),
            },
          ]),
    ) /** @since 6.3.0 */
    // "this rule probably doesn’t work for Astro components because Astro components don’t provide an event listener as syntax" - https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/click-events-have-key-events/
    .addRule(rn('click-events-have-key-events'), isForAstro ? null : ERROR) /** @since 2.2.0 */
    .addRule(
      rn('control-has-associated-label'),
      isForLit ? null : ERROR,
      setRuleOptions([
        {
          ...(customComponents.controls?.length && {controlComponents: customComponents.controls}),
          ...(labelAttributes?.length && {labelAttributes}),
          // Copied from `recommended` config (but removed `includeRoles` because it's not supported)
          ignoreElements: [
            'audio',
            'canvas',
            'embed',
            'input',
            'textarea',
            'tr',
            'video',
            // Included these two to avoid https://github.com/airbnb/javascript/issues/3069
            'th',
            'td',
          ],
          ignoreRoles: [
            'grid',
            'listbox',
            'menu',
            'menubar',
            'radiogroup',
            'row',
            'tablist',
            'toolbar',
            'tree',
            'treegrid',
          ],
        },
      ]),
    ) /** @since 6.2.0 */ // 🔴
    .addRule('definition-list', isForLit ? ERROR : null)
    .addRule(
      rn('heading-has-content'),
      isForLit ? null : ERROR,
      setRuleOptions([
        {
          ...(customComponents.headings?.length && {inputComponents: customComponents.headings}),
        },
      ]),
    ) /** @since 1.5.0 */
    .addRule('heading-hidden', isForLit ? ERROR : null)
    // Disabled because "This rule is largely superseded by the `jsx-a11y/lang` rule"
    .addRule(rn('html-has-lang'), isForLit ? null : OFF) /** @since 1.5.0 */
    .addRule(isForLit ? 'iframe-title' : rn('iframe-has-title'), ERROR) /** @since 4.0.0 */
    .addRule(
      rn('img-redundant-alt'),
      imageWords === false || imageWords?.words.length === 0
        ? OFF
        : imageWords?.severity === 'error'
          ? ERROR
          : WARNING,
      setRuleOptions([
        {
          ...(imageWords && imageWords.words.length > 0 && {words: imageWords.words}),
          ...(customComponents.imgElements?.length && {components: customComponents.imgElements}),
        },
      ]),
    ) /** @since 1.0.0 */
    .addRule(
      rn('interactive-supports-focus'),
      isForLit ? null : ERROR,
      setRuleOptions([
        {
          tabbable: getKeysOfTruthyValues({
            ...defaultTabbableRoles,
            ...tabbableRoles,
          }),
        },
      ]),
    ) /** @since 5.0.0 */
    .addRule(
      rn('label-has-associated-control'),
      isForLit ? null : ERROR,
      setRuleOptions([
        {
          ...(labelAttributes?.length && {labelAttributes}),
          ...(customComponents.labels?.length && {labelComponents: customComponents.labels}),
          ...(customComponents.controls?.length && {controlComponents: customComponents.controls}),
        },
      ]),
    ) /** @since 6.1.0 */
    .addRule(rn('lang'), isForLit ? null : ERROR) /** @since 1.5.0 */ // 🔴
    .addRule('list', isForLit ? ERROR : null)
    .addRule(
      rn('media-has-caption'),
      isForLit ? null : WARNING,
      setRuleOptions([
        {
          ...(customComponents.audioElements?.length && {audio: customComponents.audioElements}),
          ...(customComponents.videoElements?.length && {video: customComponents.videoElements}),
          ...(customComponents.trackElements?.length && {track: customComponents.trackElements}),
        },
      ]),
    ) /** @since 5.0.0 */
    // "this rule probably doesn’t work for Astro components because Astro components don’t provide an event listener as syntax" - https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/mouse-events-have-key-events/
    .addRule(
      rn('mouse-events-have-key-events'),
      isForAstro ? OFF : ERROR,
      setRuleOptions([
        {
          hoverInHandlers: getKeysOfTruthyValues({
            ...defaultHoverInHandlersRequiringOnFocus,
            ...hoverInHandlersRequiringOnFocus,
          }),
          hoverOutHandlers: getKeysOfTruthyValues({
            ...defaultHoverOutHandlersRequiringOnBlur,
            ...hoverOutHandlersRequiringOnBlur,
          }),
        },
      ]),
    ) /** @since 1.0.0 */
    .addRule(rn('no-access-key'), ERROR) /** @since 0.0.1 */
    .addRule(rn('no-aria-hidden-on-focusable'), isForLit ? null : WARNING) /** @since 6.7.1 */ // 🔴
    .addRule('no-aria-slot', isForLit ? ERROR : null)
    .addRule(
      rn('no-autofocus'),
      WARNING,
      isForLit ? [] : setRuleOptions([{ignoreNonDOM: true}]),
    ) /** @since 4.0.0 */
    .addRule(rn('no-distracting-elements'), ERROR) /** @since 4.0.0 */
    .addRule(
      rn('no-interactive-element-to-noninteractive-role'),
      isForLit ? null : ERROR,
      setRuleOptions([
        {
          // Copied from `recommended` config
          // "The recommended options for this rule allow the `tr` element to be given a role of `presentation` (or its semantic equivalent none). Under normal circumstances, an element with an interactive role should not be semantically neutralized with `presentation` (or `none`)." - rule docs
          tr: ['none', 'presentation'],
          canvas: ['img'],
        },
      ]),
    ) /** @since 5.0.0 */
    .addRule(
      rn('no-noninteractive-element-interactions'),
      isForLit ? null : ERROR,
      setRuleOptions([
        {
          // TODO copied from `recommended` config
          handlers: [
            'onClick',
            'onError',
            'onLoad',
            'onMouseDown',
            'onMouseUp',
            'onKeyPress',
            'onKeyDown',
            'onKeyUp',
          ],
          alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
          body: ['onError', 'onLoad'],
          dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
          iframe: ['onError', 'onLoad'],
          img: ['onError', 'onLoad'],
        },
      ]),
    ) /** @since 5.0.0 */
    .addRule(
      rn('no-noninteractive-element-to-interactive-role'),
      isForLit ? null : ERROR,
      setRuleOptions([
        {
          // TODO copied from `recommended` config
          ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
          ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
          li: ['menuitem', 'menuitemradio', 'menuitemcheckbox', 'option', 'row', 'tab', 'treeitem'],
          table: ['grid'],
          td: ['gridcell'],
          fieldset: ['radiogroup', 'presentation'],
        },
      ]),
    ) /** @since 5.0.0 */
    .addRule(
      rn('no-noninteractive-tabindex'),
      isForLit ? null : ERROR,
      setRuleOptions([
        // TODO copied from `recommended` config
        {
          tags: [],
          roles: ['tabpanel'],
          allowExpressionValues: true,
        },
      ]),
    ) /** @since 5.0.0 */
    .addRule(isForLit ? 'no-redundant-role' : rn('no-redundant-roles'), ERROR) /** @since 4.0.0 */
    // "this rule probably doesn’t work for Astro components because Astro components don’t provide an event listener as syntax" - https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/no-static-element-interactions/
    .addRule(
      rn('no-static-element-interactions'),
      isForAstro || isForLit ? null : ERROR,
      setRuleOptions([
        // TODO copied from `recommended` config
        {
          allowExpressionValues: true,
          handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
        },
      ]),
    ) /** @since 2.2.0 */
    .addRule('obj-alt', isForLit ? ERROR : null)
    .addRule(rn('prefer-tag-over-role'), isForLit ? null : OFF) /** @since 6.7.0 */ // 🔴
    .addRule(
      isForLit ? 'role-has-required-aria-attrs' : rn('role-has-required-aria-props'),
      ERROR,
    ) /** @since 1.0.0 */
    .addRule(
      isForLit ? 'role-supports-aria-attr' : rn('role-supports-aria-props'),
      ERROR,
    ) /** @since 1.0.0 */
    .addRule(rn('scope'), ERROR) /** @since 1.5.0 */
    .addRule(rn('tabindex-no-positive'), ERROR) /** @since 1.0.0 */
    .addRule('valid-lang', isForLit ? ERROR : null)
    .enableConfigTesterForPlugin(prefixFinal, {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) =>
        prefixFinal === 'astro' && !ruleName.startsWith('astro/jsx-a11y/'),
    })
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};

export default defineUnConfig<JsxA11yEslintConfigOptions>(
  'jsxA11y',
  true,
)((context, optionsRaw) => buildJsxA11yConfigs(context, optionsRaw));
