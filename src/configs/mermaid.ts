// cspell:ignore agentflow cynefin eventmodeling gantt gitgraph mindmap sankey treemap treeview usecase wardley xychart
import {ERROR, GLOB_MERMAID} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [Mermaid](https://mermaid.js.org) specific rules.
 * They also apply to `mermaid` and `mmd` code blocks in Markdown and MDX files.
 *
 * 📁 Default `files`: <code>**&#47;*.{mmd,mermaid}</code>
 */
export interface MermaidEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'mermaid'> {}

export default defineUnConfig<MermaidEslintConfigOptions>('mermaid', {
  enabledBy: {package: 'mermaid'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'mermaid');

  // Legend:
  // 🔴 - NOT in recommended

  configBuilder
    ?.addConfig([
      'mermaid',
      {
        filesDefault: [GLOB_MERMAID],
        parseWith: 'mermaid',
      },
    ])
    .addRule('agentflow-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('agentflow-no-duplicate-direction', ERROR) /** @since 0.1.0 */
    .addRule('agentflow-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('agentflow-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('agentflow-no-ignored-text', ERROR) /** @since 0.1.0 */
    .addRule('agentflow-no-redefined-connector', ERROR) /** @since 0.1.0 */
    .addRule('agentflow-no-redefined-flow', ERROR) /** @since 0.1.0 */
    .addRule('agentflow-no-redefined-vertex', ERROR) /** @since 0.1.0 */
    .addRule('agentflow-no-spaced-stroke', ERROR) /** @since 0.4.0 */ // 🔴
    .addRule('agentflow-no-unclosed-description-block', ERROR) /** @since 0.1.0 */ // 🔴
    .addRule('agentflow-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('architecture-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('architecture-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('architecture-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('architecture-no-reversed-marker', ERROR) /** @since 0.1.0 */
    .addRule('architecture-no-ungrouped-modifier', ERROR) /** @since 0.1.0 */
    .addRule('block-no-duplicate-block', ERROR) /** @since 0.1.0 */
    .addRule('block-no-duplicate-columns', ERROR) /** @since 0.1.0 */
    .addRule('block-no-edge-chain', ERROR) /** @since 0.1.0 */
    .addRule('block-no-edge-in-composite-head', ERROR) /** @since 0.1.0 */
    .addRule('block-no-invalid-direction', ERROR) /** @since 0.1.0 */
    .addRule('block-no-mismatched-edge', ERROR) /** @since 0.1.0 */
    .addRule('block-no-mismatched-shape', ERROR) /** @since 0.1.0 */
    .addRule('block-no-redefined-style', ERROR) /** @since 0.1.0 */
    .addRule('block-no-spaced-class-id', ERROR) /** @since 0.1.0 */
    .addRule('block-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('block-no-useless-width', ERROR) /** @since 0.1.0 */
    .addRule('c4-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('c4-no-duplicate-style', ERROR) /** @since 0.1.0 */
    .addRule('c4-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('c4-no-invalid-attribute-key', ERROR) /** @since 0.1.0 */
    .addRule('c4-no-redefined-element', ERROR) /** @since 0.1.0 */
    .addRule('c4-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('c4-no-useless-argument', ERROR) /** @since 0.1.0 */
    .addRule('class-no-bare-class-name', ERROR) /** @since 0.1.0 */
    .addRule('class-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('class-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('class-no-ignored-text', ERROR) /** @since 0.1.0 */
    .addRule('class-no-inline-comment', ERROR) /** @since 0.1.0 */ // 🔴
    .addRule('class-no-redefined-class', ERROR) /** @since 0.1.0 */
    .addRule('class-no-unclosed-backquote', ERROR) /** @since 0.1.0 */ // cspell:disable-line
    .addRule('class-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('cynefin-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('cynefin-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('cynefin-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('cynefin-no-redefined-domain', ERROR) /** @since 0.1.0 */
    .addRule('er-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('er-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('er-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('er-no-ignored-text', ERROR) /** @since 0.1.0 */ // 🔴
    .addRule('er-no-redefined-entity', ERROR) /** @since 0.1.0 */
    .addRule('er-no-unclosed-description-block', ERROR) /** @since 0.1.0 */ // 🔴
    .addRule('er-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('eventmodeling-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('eventmodeling-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('eventmodeling-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('eventmodeling-no-redefined-data', ERROR) /** @since 0.1.0 */
    .addRule('eventmodeling-no-unclosed-description-block', ERROR) /** @since 0.1.0 */ // 🔴
    .addRule('eventmodeling-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('flowchart-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('flowchart-no-duplicate-direction', ERROR) /** @since 0.1.0 */
    .addRule('flowchart-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('flowchart-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('flowchart-no-ignored-text', ERROR) /** @since 0.1.0 */
    .addRule('flowchart-no-redefined-subgraph', ERROR) /** @since 0.1.0 */
    .addRule('flowchart-no-redefined-vertex', ERROR) /** @since 0.1.0 */
    .addRule('flowchart-no-spaced-stroke', ERROR) /** @since 0.4.0 */ // 🔴
    .addRule('flowchart-no-unclosed-description-block', ERROR) /** @since 0.1.0 */ // 🔴
    .addRule('flowchart-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('gantt-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('gantt-no-duplicate-id', ERROR) /** @since 0.1.0 */
    .addRule('gantt-no-duplicate-setting', ERROR) /** @since 0.1.0 */
    .addRule('gantt-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('gantt-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('gantt-no-invalid-tag', ERROR) /** @since 0.1.0 */
    .addRule('gantt-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('gantt-no-unknown-exclude', ERROR) /** @since 0.1.0 */
    .addRule('gitgraph-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('gitgraph-no-duplicate-option', ERROR) /** @since 0.1.0 */
    .addRule('gitgraph-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('gitgraph-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('gitgraph-no-redefined-commit', ERROR) /** @since 0.1.0 */
    .addRule('journey-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('journey-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('journey-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('journey-no-empty-person', ERROR) /** @since 0.1.0 */
    .addRule('journey-no-ignored-text', ERROR) /** @since 0.1.0 */
    .addRule('journey-no-invalid-score', ERROR) /** @since 0.1.0 */
    .addRule('kanban-no-duplicate-section', ERROR) /** @since 0.1.0 */
    .addRule('mindmap-no-duplicate-decoration', ERROR) /** @since 0.1.0 */
    .addRule('mindmap-no-mismatched-shape', ERROR) /** @since 0.1.0 */
    .addRule('no-duplicate-init-key', ERROR) /** @since 0.1.0 */
    .addRule('no-invalid-init-directive', ERROR) /** @since 0.1.0 */
    .addRule('no-unclosed-directive', ERROR) /** @since 0.1.0 */
    .addRule('packet-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('packet-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('packet-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('pie-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('pie-no-duplicate-label', ERROR) /** @since 0.1.0 */
    .addRule('pie-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('pie-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('quadrant-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('quadrant-no-duplicate-style', ERROR) /** @since 0.1.0 */
    .addRule('quadrant-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('quadrant-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('quadrant-no-invalid-color', ERROR) /** @since 0.4.0 */
    .addRule('quadrant-no-invalid-coordinate', ERROR) /** @since 0.1.0 */
    .addRule('quadrant-no-redefined-axis', ERROR) /** @since 0.1.0 */
    .addRule('quadrant-no-redefined-class', ERROR) /** @since 0.1.0 */
    .addRule('quadrant-no-redefined-quadrant', ERROR) /** @since 0.1.0 */
    .addRule('quadrant-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('radar-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('radar-no-duplicate-entry', ERROR) /** @since 0.1.0 */
    .addRule('radar-no-duplicate-option', ERROR) /** @since 0.1.0 */
    .addRule('radar-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('radar-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('radar-no-mismatched-entry-count', ERROR) /** @since 0.1.0 */
    .addRule('radar-no-reversed-range', ERROR) /** @since 0.1.0 */
    .addRule('radar-no-unclosed-description-block', ERROR) /** @since 0.1.0 */ // 🔴
    .addRule('radar-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('railroad-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('railroad-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('railroad-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('requirement-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('requirement-no-duplicate-field', ERROR) /** @since 0.1.0 */
    .addRule('requirement-no-duplicate-name', ERROR) /** @since 0.1.0 */
    .addRule('requirement-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('requirement-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('requirement-no-ignored-text', ERROR) /** @since 0.1.0 */
    .addRule('requirement-no-unclosed-description-block', ERROR) /** @since 0.1.0 */ // 🔴
    .addRule('requirement-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('sankey-no-empty-node', ERROR) /** @since 0.1.0 */
    .addRule('sankey-no-invalid-value', ERROR) /** @since 0.1.0 */
    .addRule('sequence-no-create-destroy', ERROR) /** @since 0.1.0 */
    .addRule('sequence-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('sequence-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('sequence-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('sequence-no-ignored-text', ERROR) /** @since 0.1.0 */
    .addRule('sequence-no-invalid-json', ERROR) /** @since 0.1.0 */
    .addRule('sequence-no-link-without-separator', ERROR) /** @since 0.1.0 */
    .addRule('sequence-no-unclosed-description-block', ERROR) /** @since 0.1.0 */ // 🔴
    .addRule('state-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('state-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('state-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('state-no-ignored-text', ERROR) /** @since 0.1.0 */
    .addRule('state-no-unclosed-description-block', ERROR) /** @since 0.1.0 */ // 🔴
    .addRule('state-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('timeline-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('timeline-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('timeline-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('treemap-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('treemap-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('treemap-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('treemap-no-invalid-value', ERROR) /** @since 0.1.0 */
    .addRule('treeview-no-duplicate-annotation', ERROR) /** @since 0.1.0 */
    .addRule('treeview-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('treeview-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('treeview-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('treeview-no-unclosed-description-block', ERROR) /** @since 0.1.0 */
    .addRule('usecase-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('usecase-no-duplicate-direction', ERROR) /** @since 0.1.0 */
    .addRule('usecase-no-duplicate-metadata', ERROR) /** @since 0.1.0 */
    .addRule('usecase-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('usecase-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('usecase-no-redefined-class', ERROR) /** @since 0.1.0 */
    .addRule('usecase-no-unclosed-description-block', ERROR) /** @since 0.1.0 */ // 🔴
    .addRule('venn-no-duplicate-style', ERROR) /** @since 0.1.0 */
    .addRule('venn-no-duplicate-subset', ERROR) /** @since 0.1.0 */
    .addRule('venn-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('venn-no-ignored-text', ERROR) /** @since 0.1.0 */
    .addRule('venn-no-invalid-style-key', ERROR) /** @since 0.1.0 */
    .addRule('venn-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('wardley-no-duplicate-annotations', ERROR) /** @since 0.1.0 */
    .addRule('wardley-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('wardley-no-duplicate-evolution', ERROR) /** @since 0.1.0 */
    .addRule('wardley-no-duplicate-evolve', ERROR) /** @since 0.1.0 */
    .addRule('wardley-no-duplicate-pipeline', ERROR) /** @since 0.1.0 */
    .addRule('wardley-no-duplicate-size', ERROR) /** @since 0.1.0 */
    .addRule('wardley-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('wardley-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('wardley-no-ignored-link-label', ERROR) /** @since 0.1.0 */
    .addRule('wardley-no-redefined-node', ERROR) /** @since 0.1.0 */
    .addRule('wardley-no-undef', ERROR) /** @since 0.1.0 */
    .addRule('xychart-no-duplicate-description', ERROR) /** @since 0.1.0 */
    .addRule('xychart-no-duplicate-title', ERROR) /** @since 0.1.0 */
    .addRule('xychart-no-empty-description-block', ERROR) /** @since 0.1.0 */
    .addRule('xychart-no-extra-value', ERROR) /** @since 0.1.0 */
    .addRule('xychart-no-invalid-orientation', ERROR) /** @since 0.1.0 */
    .addRule('xychart-no-redefined-axis', ERROR) /** @since 0.1.0 */
    .addRule('xychart-no-unclosed-description-block', ERROR) /** @since 0.1.0 */
    .enableConfigTesterForPlugin('mermaid')
    .addOverrides();
});
