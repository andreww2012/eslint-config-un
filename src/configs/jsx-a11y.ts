// cspell:ignore spinbutton treegrid menuitemradio menuitemcheckbox
import {ERROR, GLOB_JS_TS_X_ONLY, OFF, WARNING} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import type {OmitIndexSignature} from '../types';
import {type MaybeFn, assignDefaults, getKeysOfTruthyValues, maybeCall} from '../utils';
import type {UnConfigFn} from './index';

const DEFAULT_AMBIGUOUS_WORDS = ['click here', 'here', 'link', 'a link', 'learn more'];

interface WordsListAndOptionalSeverity {
  words: string[];
  severity?: 'error' | 'warn';
}

type AltTextCheckDefaultElements = keyof Omit<
  OmitIndexSignature<GetRuleOptions<'jsx-a11y', 'alt-text'>[0] & {}>,
  'elements'
>;
const altTextCheckDefaultElements: Record<AltTextCheckDefaultElements, true> = {
  img: true,
  object: true,
  area: true,
  'input[type="image"]': true,
};

type AnchorIsValidAspectsToCheck = ((GetRuleOptions<
  'jsx-a11y',
  'anchor-is-valid'
>[0] & {})['aspects'] & {})[number];
const anchorIsValidDefaultAspectsToCheck: Partial<Record<AnchorIsValidAspectsToCheck, true>> = {
  noHref: true,
  invalidHref: true,
};

type PossibleTabbableRoles = ((GetRuleOptions<
  'jsx-a11y',
  'interactive-supports-focus'
>[0] & {})['tabbable'] & {})[number];
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

export interface JsxA11yEslintConfigOptions extends UnConfigOptions<'jsx-a11y'> {
  /**
   * [`eslint-plugin-jsx-a11y`](https://npmjs.com/eslint-plugin-jsx-a11y) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `jsx-a11y` property and applied to the specified `files` and `ignores`.
   */
  settings?: {
    attributes?: {
      for?: string[];
    };

    /**
     * Keys are custom component names that render an HTML element specified in the value.
     */
    components?: Record<string, string>;

    /**
     * "Defines the prop your code uses to create polymorphic components. This setting will be used determine the element type in rules that require semantic context. To restrict polymorphic linting to specified components, additionally set `polymorphicAllowList` to an array of component names." - [plugin docs](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y#polymorphic-components).
     */
    polymorphicPropName?: string;

    /**
     * See `polymorphicPropName` docs.
     */
    polymorphicAllowList?: string[];
  };

  /**
   * Elements to check for `alt` attribute on by [`alt-text`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/alt-text.md) rule.
   *
   * By default, `<img>`, `<area>`, `<input type="image">`, and `<object>` elements are checked.
   * Using the object syntax, you can disable the default checks or specify additional elements.
   * Setting to `false` will disable the rule.
   */
  altTextCheckForElements?:
    | false
    | Partial<Record<AltTextCheckDefaultElements | (string & {}), boolean>>;

  /**
   * Anchor aspects to check by [`anchor-is-valid`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/anchor-is-valid.md) rule.
   *
   * By default, `noHref` and `invalidHref` aspects are checked.
   * Using the object syntax, you can disable the default checks or specify additional aspects.
   * Setting to `false` will disable the rule.
   */
  anchorIsValidCheckedAspects?: false | Partial<Record<AnchorIsValidAspectsToCheck, boolean>>;

  /**
   * List of words that will be considered ambiguous and will be flagged by
   * [`anchor-ambiguous-text`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/anchor-ambiguous-text.md) rule.
   *
   * Can be either an array or a function to which the default words will be passed
   * as the only argument. Setting to `false` will disable the rule.
   *
   * Default rule severity is `warn` and the list of words is the same as listed in the rule docs.
   */
  ambiguousWordsForAnchorText?: MaybeFn<
    [defaultWords: string[]],
    false | WordsListAndOptionalSeverity
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
   * [`img-redundant-alt`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/img-redundant-alt.md) rule.
   * if contained in the image alt text.
   *
   * Will be merged with the default words listed in the rule docs, and this behavior
   * cannot be changed. Setting to `false` will disable the rule.
   *
   * Default rule severity is `warn`.
   */
  imageWords?: false | WordsListAndOptionalSeverity;

  /**
   * "A list of attributes to check on the label component and its children for a label. Use this if you have a custom component that uses a string passed on a prop to render an HTML label, for example." - plugin docs.
   *
   * Will be merged with the built-ins `['alt', 'aria-label', 'aria-labelledby']`.
   *
   * Used in rules:
   * - [`control-has-associated-label`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/control-has-associated-label.md)
   * - [`label-has-associated-control`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/label-has-associated-control.md)
   */
  labelAttributes?: string[];

  /**
   * The list of roles that will be checked by [`interactive-supports-focus`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/interactive-supports-focus.md) rule.
   *
   * The default list of roles is `['button', 'checkbox', 'link', 'searchbox', 'spinbutton', 'switch', 'textbox']`.
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
     * Used in rules:
     * - [`alt-text`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/alt-text.md)
     */
    areaElements?: string[];

    /**
     * List of components that render an `<audio>` element.
     *
     * Used in rules:
     * - [`media-has-caption`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/media-has-caption.md)
     */
    audioElements?: string[];

    /**
     * List of components that render a control (an interactive element).
     *
     * Used in rules:
     * - [`control-has-associated-label`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/control-has-associated-label.md)
     * - [`label-has-associated-control`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/label-has-associated-control.md)
     */
    controls?: string[];

    /**
     * List of components that render a heading (`<h1>`, `<h2>`, etc.).
     *
     * Used in rules:
     * - [`heading-has-content`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/heading-has-content.md)
     */
    headings?: string[];

    /**
     * List of components that render an `<img>` element.
     *
     * Used in rules:
     * - [`alt-text`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/alt-text.md)
     * - [`img-redundant-alt`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/img-redundant-alt.md)
     */
    imgElements?: string[];

    /**
     * List of components that render an `<input>` element with `type="image"`.
     *
     * Used in rules:
     * - [`alt-text`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/alt-text.md)
     */
    inputTypeImageElements?: string[];

    /**
     * List of components that render an `<input>` element which accepts text input.
     *
     * Used in rules:
     * - [`autocomplete-valid`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/autocomplete-valid.md)
     */
    inputs?: string[];

    /**
     * List of components that render a `<label>` element.
     *
     * Used in rules:
     * - [`label-has-associated-control`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/label-has-associated-control.md)
     */
    labels?: string[];

    /**
     * List of components that render a link.
     *
     * Used in rules:
     * - [`anchor-is-valid`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/anchor-is-valid.md)
     * - [`anchor-has-content`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/anchor-has-content.md)
     */
    links?: string[];

    /**
     * List of components that render an `<object>` element.
     *
     * Used in rules:
     * - [`alt-text`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/alt-text.md)
     */
    objectElements?: string[];

    /**
     * List of components that render a `<track>` element.
     *
     * Used in rules:
     * - [`media-has-caption`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/media-has-caption.md)
     */
    trackElements?: string[];

    /**
     * List of components that render a `<video>` element.
     *
     * Used in rules:
     * - [`media-has-caption`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/media-has-caption.md)
     */
    videoElements?: string[];
  };
}

export const jsxA11yUnConfig: UnConfigFn<
  'jsxA11y',
  unknown,
  [
    customConfig?: {
      prefix: 'astro';
      options: JsxA11yEslintConfigOptions & UnConfigOptions;
    },
  ]
> = (context, customConfig) => {
  const optionsRaw = customConfig?.options ?? context.rootOptions.configs?.jsxA11y;
  const optionsResolved = assignDefaults(optionsRaw, {
    ambiguousWordsForAnchorText: {
      words: DEFAULT_AMBIGUOUS_WORDS,
    } as JsxA11yEslintConfigOptions['ambiguousWordsForAnchorText'] & {},
    customComponents: {} as JsxA11yEslintConfigOptions['customComponents'] & {},
  } satisfies JsxA11yEslintConfigOptions);

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
    true,
  );

  const prefixFinal = customConfig?.prefix ?? 'jsx-a11y';
  const isForAstro = prefixFinal === 'astro'; // TODO

  // `rn` means "rule name"
  const rn = <T extends string>(ruleName: T) =>
    `${isForAstro ? 'jsx-a11y/' : ''}${ruleName}` as const;

  const configBuilder = createConfigBuilder(context, optionsResolved, prefixFinal);

  // Legend:
  // 🔴 - NOT in recommended

  configBuilder
    ?.addConfig(
      [
        prefixFinal,
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: [GLOB_JS_TS_X_ONLY],
        },
      ],
      {
        ...(pluginSettings && {
          settings: {
            'jsx-a11y': pluginSettings,
          },
        }),
      },
    )
    .addRule(rn('alt-text'), altTextCheckForElements === false ? OFF : ERROR, [
      {
        elements: getKeysOfTruthyValues({
          ...altTextCheckDefaultElements,
          ...altTextCheckForElements,
        }),
        ...(customComponents.imgElements?.length && {img: customComponents.imgElements}),
        ...(customComponents.objectElements?.length && {object: customComponents.objectElements}),
        ...(customComponents.areaElements?.length && {area: customComponents.areaElements}),
        ...(customComponents.inputTypeImageElements?.length && {
          'input[type="image"]': customComponents.inputTypeImageElements,
        }),
      },
    ])
    .addRule(
      rn('anchor-ambiguous-text'),
      ambiguousWords === false ? OFF : ambiguousWords.severity === 'error' ? ERROR : WARNING,
      [
        {
          ...(ambiguousWords && ambiguousWords.words.length > 0 && {words: ambiguousWords.words}),
        },
      ],
    ) // 🔴
    .addRule(rn('anchor-has-content'), ERROR, [
      {
        ...(customComponents.links?.length && {components: customComponents.links}),
      },
    ])
    .addRule(
      rn('anchor-is-valid'),
      anchorIsValidCheckedAspects === false || anchorIsValidFinalCheckedAspects == null
        ? OFF
        : ERROR,
      [
        {
          ...(customComponents.links?.length && {components: customComponents.links}),
          aspects: anchorIsValidFinalCheckedAspects,
        },
      ],
    )
    .addRule(rn('aria-activedescendant-has-tabindex'), ERROR)
    .addRule(rn('aria-props'), ERROR)
    .addRule(rn('aria-proptypes'), ERROR)
    .addRule(rn('aria-role'), ERROR)
    .addRule(rn('aria-unsupported-elements'), ERROR)
    .addRule(rn('autocomplete-valid'), ERROR, [
      {
        ...(customComponents.inputs?.length && {inputComponents: customComponents.inputs}),
      },
    ])
    // "this rule probably doesn’t work for Astro components because Astro components don’t provide an event listener as syntax" - https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/click-events-have-key-events/
    .addRule(rn('click-events-have-key-events'), isForAstro ? OFF : ERROR)
    .addRule(rn('control-has-associated-label'), ERROR, [
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
    ]) // 🔴
    .addRule(rn('heading-has-content'), ERROR, [
      {
        ...(customComponents.headings?.length && {inputComponents: customComponents.headings}),
      },
    ])
    // Disabled because "This rule is largely superseded by the `lang` rule"
    .addRule(rn('html-has-lang'), OFF)
    .addRule(rn('iframe-has-title'), ERROR)
    .addRule(
      rn('img-redundant-alt'),
      imageWords === false || (imageWords && imageWords.words.length === 0)
        ? OFF
        : imageWords?.severity === 'error'
          ? ERROR
          : WARNING,
      [
        {
          ...(imageWords && imageWords.words.length > 0 && {words: imageWords.words}),
          ...(customComponents.imgElements?.length && {components: customComponents.imgElements}),
        },
      ],
    )
    .addRule(rn('interactive-supports-focus'), ERROR, [
      {
        tabbable: getKeysOfTruthyValues({
          ...defaultTabbableRoles,
          ...tabbableRoles,
        }),
      },
    ])
    .addRule(rn('label-has-associated-control'), ERROR, [
      {
        ...(labelAttributes?.length && {labelAttributes}),
        ...(customComponents.labels?.length && {labelComponents: customComponents.labels}),
        ...(customComponents.controls?.length && {controlComponents: customComponents.controls}),
      },
    ])
    .addRule(rn('lang'), ERROR) // 🔴
    .addRule(rn('media-has-caption'), WARNING, [
      {
        ...(customComponents.audioElements?.length && {audio: customComponents.audioElements}),
        ...(customComponents.videoElements?.length && {video: customComponents.videoElements}),
        ...(customComponents.trackElements?.length && {track: customComponents.trackElements}),
      },
    ])
    // "this rule probably doesn’t work for Astro components because Astro components don’t provide an event listener as syntax" - https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/mouse-events-have-key-events/
    .addRule(rn('mouse-events-have-key-events'), isForAstro ? OFF : ERROR, [
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
    ])
    .addRule(rn('no-access-key'), ERROR)
    .addRule(rn('no-aria-hidden-on-focusable'), WARNING) // 🔴
    .addRule(rn('no-autofocus'), WARNING, [{ignoreNonDOM: true}])
    .addRule(rn('no-distracting-elements'), ERROR)
    .addRule(rn('no-interactive-element-to-noninteractive-role'), ERROR, [
      {
        // Copied from `recommended` config
        // "The recommended options for this rule allow the `tr` element to be given a role of `presentation` (or its semantic equivalent none). Under normal circumstances, an element with an interactive role should not be semantically neutralized with `presentation` (or `none`)." - rule docs
        tr: ['none', 'presentation'],
        canvas: ['img'],
      },
    ])
    .addRule(rn('no-noninteractive-element-interactions'), ERROR, [
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
    ])
    .addRule(rn('no-noninteractive-element-to-interactive-role'), ERROR, [
      {
        // TODO copied from `recommended` config
        ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        li: ['menuitem', 'menuitemradio', 'menuitemcheckbox', 'option', 'row', 'tab', 'treeitem'],
        table: ['grid'],
        td: ['gridcell'],
        fieldset: ['radiogroup', 'presentation'],
      },
    ])
    .addRule(rn('no-noninteractive-tabindex'), ERROR, [
      // TODO copied from `recommended` config
      {
        tags: [],
        roles: ['tabpanel'],
        allowExpressionValues: true,
      },
    ])
    .addRule(rn('no-redundant-roles'), ERROR)
    // "this rule probably doesn’t work for Astro components because Astro components don’t provide an event listener as syntax" - https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/no-static-element-interactions/
    .addRule(rn('no-static-element-interactions'), isForAstro ? OFF : ERROR, [
      // TODO copied from `recommended` config
      {
        allowExpressionValues: true,
        handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
      },
    ])
    .addRule(rn('prefer-tag-over-role'), OFF) // 🔴
    .addRule(rn('role-has-required-aria-props'), ERROR)
    .addRule(rn('role-supports-aria-props'), ERROR)
    .addRule(rn('scope'), ERROR)
    .addRule(rn('tabindex-no-positive'), ERROR)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
