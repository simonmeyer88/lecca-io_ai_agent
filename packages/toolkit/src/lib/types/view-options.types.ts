export type ViewOptions = {
  hideConditions?: boolean;
  showWebhookListenerButton?: boolean;
  showManualInputButton?: boolean;
  manualInputButtonOptions?: {
    label: string;
    tooltip: string;
  };
  saveButtonOptions?: {
    /**
     * This would hide the "Save & Test" (Now Generate Output) button regardless of
     * if you have replaceSaveAndTestButton values set or not.
     */
    hideSaveAndTestButton?: boolean;

    /**
     * This would hide the "Save" button, not the Save & Test button.
     * This is useful for actions/triggers where when you save it, it needs to
     * generate an outcome or run the node immediately.
     *
     * Currently used for the "Manually Run" trigger with the replaceMainButton
     * because when you save a manually run trigger, you want it to run the mockRun
     * so it can generate the custom input config for that workflow so other workflows
     * can map their input values when using the "Run Workflow" action.
     *
     * Also used for the "Output Workflow Data" action with the replaceMainButton
     * because when you save the "Output Workflow Data" action, you want it to run the mockRun
     * because the mockRun for that trigger generates the output on the workflow so other workflows
     * can map their values when using the "Run Workflow" action.
     */
    hideSaveButton?: boolean;

    /**
     * Some "Save & Test" buttons don't work for all triggers/actions.
     * For example, the "Manually Run" trigger doesn't have a "Save & Test" button.
     * It has a "Save & Generate Output" button. So we would use this to replace the button
     * and configure whether it calls the real run or the mock run.
     *
     * So instead of the "Save & Test" button being a dropdown for Real or Mock, it would be replaced
     * with the options selected.
     */
    replaceSaveAndTestButton?: {
      type: 'real' | 'mock';
      label: string;
      tooltip?: string;
    };
    replaceSaveButton?: {
      type: 'real' | 'mock' | 'save';
      label: string;
      tooltip?: string;
    };
  };
};
