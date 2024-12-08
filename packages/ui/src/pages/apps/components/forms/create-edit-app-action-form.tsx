import { WorkflowApp } from '@/models/workflow/workflow-app-model';

type CreateEditAppActionFormProps = {
  app: WorkflowApp;
};

export function CreateEditAppActionForm(props: CreateEditAppActionFormProps) {
  return (
    <div className="flex w-[5000px]">
      {props.app.name}
      <div className="flex-1 flex items-center justify-center">
        Form builder here
      </div>
      <div className="flex-1 flex items-center justify-center">
        Form Preview here
      </div>
    </div>
  );
}

// import { zodResolver } from '@hookform/resolvers/zod';
// import { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';

// import useApiMutation from '@/api/use-api-mutation';
// import { EmptyPlaceholder } from '@/components/empty-placeholder';
// import { Icons } from '@/components/icons';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Dialog } from '@/components/ui/dialog';
// import { DropdownMenu } from '@/components/ui/dropdown-menu';
// import { Form } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Select } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { useToast } from '@/hooks/useToast';
// import {
//   CreateFieldConfigType,
//   FieldConfig,
//   createFieldConfigSchema,
// } from '@/models/workflow/input-config-model';
// import {
//   CreateWorkflowAppActionType,
//   UpdateWorkflowAppActionType,
//   WorkflowAppActionType,
//   createWorkflowAppActionSchema,
// } from '@/models/workflow/workflow-app-action-model';
// import { WorkflowApp } from '@/models/workflow/workflow-app-model';
// import { DynamicFormField } from '@/pages/projects/components/workflow/nodes/action-node/builder/dynamic-form-field';

// type CreateEditAppActionFormProps = {
//   app: WorkflowApp;
//   action?: WorkflowAppActionType;
// };

// export function CreateEditAppActionForm({
//   app,
//   action,
// }: CreateEditAppActionFormProps) {
//   const { toast } = useToast();
//   const [status, setStatus] = useState<
//     'idle' | 'loading' | 'success' | 'error'
//   >('idle');
//   const [inputFields, setInputFields] = useState(action?.inputConfig ?? []);
//   const [showPreview, setShowPreview] = useState(true);
//   const [selectedType, setSelectedType] = useState<FieldConfig['inputType']>();
//   const [selectedInputField, setSelectedInputField] = useState<FieldConfig>();
//   const form = useForm<CreateWorkflowAppActionType>({
//     resolver: zodResolver(createWorkflowAppActionSchema),
//     defaultValues: {
//       name: action?.name ?? '',
//       description: action?.description ?? '',
//     },
//   });

//   const createMutation = useApiMutation({
//     service: 'workflowApps',
//     method: 'createAction',
//     apiLibraryArgs: {
//       workflowAppId: app.id,
//     },
//   });

//   const editMutation = useApiMutation({
//     service: 'workflowApps',
//     method: 'updateAction',
//     apiLibraryArgs: {
//       workflowAppId: app.id,
//     },
//   });

//   const onCreate = async (values: CreateWorkflowAppActionType) => {
//     setStatus('loading');
//     await createMutation.mutateAsync(
//       {
//         data: {
//           ...values,
//         },
//       },
//       {
//         onSuccess: () => {
//           setStatus('success');
//           toast({ title: 'Action created' });
//         },
//         onError: () => {
//           setStatus('error');
//         },
//       },
//     );
//   };

//   const onEdit = async (values: UpdateWorkflowAppActionType) => {
//     setStatus('loading');
//     await editMutation.mutateAsync(
//       {
//         actionId: action?.id,
//         data: {
//           ...values,
//         },
//       },
//       {
//         onSuccess: () => {
//           setStatus('success');
//           toast({ title: 'Action updated' });
//         },
//         onError: () => {
//           setStatus('error');
//         },
//       },
//     );
//   };

//   const onBuildInputField = ({
//     type,
//     inputField,
//   }: {
//     type: FieldConfig['inputType'];
//     inputField?: FieldConfig;
//   }) => {
//     setSelectedType(type);
//     setShowPreview(false);
//     if (inputField) {
//       setSelectedInputField(inputField);
//     }
//   };

//   const onAddInputField = (field: any) => {
//     setSelectedType(undefined);

//     const index = inputFields.findIndex((f) => f.id === field.id);
//     if (index > -1) {
//       const newInputFields = [...inputFields];
//       newInputFields[index] = field;
//       setInputFields(newInputFields);
//     } else {
//       setInputFields([...inputFields, field]);
//     }

//     setSelectedInputField(undefined);
//   };

//   useEffect(() => {
//     if (showPreview) {
//       setSelectedType(undefined);
//       setSelectedInputField(undefined);
//     }
//   }, [showPreview]);

//   const onSubmit = action ? onEdit : onCreate;

//   return (
//     <div className="flex">
//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="flex-1 w-full h-full max-h-[80dvh] flex flex-col"
//         >
//           {status === 'success' ? (
//             <SuccessFormContent variant={action ? 'edit' : 'create'} />
//           ) : status === 'error' ? (
//             <ErrorFormContent variant={action ? 'edit' : 'create'} />
//           ) : (
//             <>
//               <Form.Header className="pb-5">
//                 <Form.Title>
//                   {action ? 'Update Action' : 'New Action'}
//                 </Form.Title>
//                 <Form.Subtitle>
//                   Action will be immediately available in your app.
//                 </Form.Subtitle>
//               </Form.Header>
//               <ScrollArea className="h-full">
//                 <Form.Content className="space-y-6">
//                   <Form.Field
//                     control={form.control}
//                     name="name"
//                     render={({ field }) => (
//                       <Form.Item>
//                         <Form.Label>Action Name</Form.Label>
//                         <Form.Control>
//                           <Input
//                             {...form.register('name')}
//                             {...field}
//                             placeholder="Add a name"
//                           />
//                         </Form.Control>
//                       </Form.Item>
//                     )}
//                   />
//                   <Form.Field
//                     control={form.control}
//                     name="description"
//                     render={({ field }) => (
//                       <Form.Item>
//                         <Form.Label>Action Description</Form.Label>
//                         <Form.Control>
//                           <Textarea
//                             {...form.register('description')}
//                             {...field}
//                             placeholder="Add a description"
//                           />
//                         </Form.Control>
//                       </Form.Item>
//                     )}
//                   />
//                   <div className="space-y-4">
//                     {inputFields.length > 0 && <Form.Label>Fields</Form.Label>}
//                     {inputFields.map((field, index) => (
//                       <FieldItem
//                         key={field.id}
//                         field={field}
//                         onBuildInputField={({ type, inputField }) => {
//                           onBuildInputField({ type, inputField });
//                         }}
//                         onDeleteField={() => {
//                           setInputFields(
//                             inputFields.filter((_, i) => i !== index),
//                           );
//                         }}
//                       />
//                     ))}
//                   </div>
//                   <SelectInputFieldDropdown
//                     onBuildInputField={onBuildInputField}
//                   />
//                 </Form.Content>
//               </ScrollArea>
//               <Form.Footer className="space-x-2 flex justify-end py-2 border-t">
//                 <Dialog.Close asChild>
//                   <Button variant="ghost">Close</Button>
//                 </Dialog.Close>
//                 <Button
//                   type="button"
//                   onClick={form.handleSubmit(onSubmit)}
//                   variant="default"
//                   loading={status === 'loading'}
//                   disabled={!form.formState.isValid}
//                 >
//                   {action ? 'Save' : 'Create'}
//                 </Button>
//               </Form.Footer>
//             </>
//           )}
//         </form>
//       </Form>
//       {status === 'success' || status === 'error' ? null : (
//         <div className="flex-1 border-l h-full max-h-full">
//           {showPreview ? (
//             <Preview
//               inputFields={inputFields}
//               onBuildInputField={onBuildInputField}
//             />
//           ) : (
//             <BuildInputField
//               type={selectedType}
//               field={selectedInputField}
//               onAddInputField={onAddInputField}
//               setShowPreview={setShowPreview}
//             />
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// function BuildInputField({
//   type,
//   field,
//   setShowPreview,
//   onAddInputField,
// }: {
//   type?: FieldConfig['inputType'];
//   field?: FieldConfig;
//   setShowPreview: (val: boolean) => void;
//   onAddInputField: (field: any) => void;
// }) {
//   const form = useForm<CreateFieldConfigType>({
//     resolver: zodResolver(createFieldConfigSchema),
//     defaultValues: {
//       inputType: type,
//       id: field?.id ?? '',
//       label: field?.label ?? '',
//       description: field?.description ?? '',
//       placeholder: field?.placeholder ?? '',
//       occurenceType: field?.occurenceType ?? 'single',
//       defaultValue: field?.defaultValue ?? '',
//     },
//   });

//   const onSubmit = (values: CreateFieldConfigType) => {
//     onAddInputField(values);
//     setShowPreview(true);
//   };

//   return (
//     <Form {...form}>
//       <form className="flex-1 h-full max-h-[80dvh] flex flex-col">
//         <Form.Header>
//           <Form.Title>
//             Configure{' '}
//             {type ? `${type.charAt(0).toUpperCase() + type.slice(1)}` : ''}{' '}
//             Field
//           </Form.Title>
//           <Form.Subtitle>
//             Configure the details of the field you want to add.
//           </Form.Subtitle>
//         </Form.Header>
//         <ScrollArea className="h-full">
//           <Form.Content className="space-y-6">
//             <Form.Field
//               control={form.control}
//               name="label"
//               render={({ field }) => (
//                 <Form.Item>
//                   <Form.Label>Field Label</Form.Label>
//                   <Form.Control>
//                     <Input
//                       {...form.register('label')}
//                       {...field}
//                       placeholder="Add a label"
//                     />
//                   </Form.Control>
//                 </Form.Item>
//               )}
//             />

//             <Form.Field
//               control={form.control}
//               name="id"
//               render={({ field }) => (
//                 <Form.Item>
//                   <Form.Label>Field Id</Form.Label>
//                   <Form.Control>
//                     <Input
//                       {...form.register('id')}
//                       {...field}
//                       placeholder="Add an id"
//                     />
//                   </Form.Control>
//                 </Form.Item>
//               )}
//             />

//             <Form.Field
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <Form.Item>
//                   <Form.Label>Field Description</Form.Label>
//                   <Form.Control>
//                     <Textarea
//                       {...form.register('description')}
//                       {...field}
//                       placeholder="Add a description"
//                     />
//                   </Form.Control>
//                 </Form.Item>
//               )}
//             />

//             <Form.Field
//               control={form.control}
//               name="occurenceType"
//               render={({ field }) => (
//                 <Form.Item>
//                   <Form.Label>Occurence Type</Form.Label>
//                   <Form.Control>
//                     <Select onValueChange={field.onChange}>
//                       <Select.Trigger>
//                         <Select.Value
//                           placeholder={
//                             field.value
//                               ? field.value
//                               : 'Select an occurence type'
//                           }
//                         />
//                       </Select.Trigger>
//                       <Select.Content>
//                         <Select.Item value="single">Single</Select.Item>
//                         <Select.Item value="multiple">Multiple</Select.Item>
//                       </Select.Content>
//                     </Select>
//                   </Form.Control>
//                 </Form.Item>
//               )}
//             />

//             {/* {type === 'select' ||
//               (type === 'multi-select' && (
//                 <Form.Field
//                   control={form.control}
//                   name="selectOptions"
//                   render={({ field }) => (
//                     <Form.Item>
//                       <Form.Label>Select Options</Form.Label>
//                       <Form.Control>
//                         <Input
//                           {...form.register('selectOptions')}
//                           {...field}
//                           placeholder="Add options"
//                         />
//                       </Form.Control>
//                     </Form.Item>
//                   )}
//                 />
//               ))} */}

//             {/* <Form.Field
//               control={form.control}
//               name="switchOptions"
//               render={({ field }) => (
//                 <Form.Item>
//                   <Form.Label>Switch Options</Form.Label>
//                   <Form.Control>
//                     <Input
//                 {...form.register('switchOptions')}
//                 {...field}
//                 placeholder="Add options"
//               />
//                   </Form.Control>
//                 </Form.Item>
//               )}
//             /> */}

//             <Form.Field
//               control={form.control}
//               name="placeholder"
//               render={({ field }) => (
//                 <Form.Item>
//                   <Form.Label>Placeholder</Form.Label>
//                   <Form.Control>
//                     <Input
//                       {...form.register('placeholder')}
//                       {...field}
//                       placeholder="Add a placeholder"
//                     />
//                   </Form.Control>
//                 </Form.Item>
//               )}
//             />

//             <Form.Field
//               control={form.control}
//               name="defaultValue"
//               render={({ field }) => (
//                 <Form.Item>
//                   <Form.Label>Default Value</Form.Label>
//                   <Form.Control>
//                     <Input
//                       {...form.register('defaultValue')}
//                       {...field}
//                       placeholder="Add a default value"
//                     />
//                   </Form.Control>
//                 </Form.Item>
//               )}
//             />

//             {/* <Form.Field
//               control={form.control}
//               name="required"
//               render={({ field }) => (
//                 <Form.Item>
//                   <Form.Label>Required</Form.Label>
//                   <Form.Control>
//                     <Input
//                 {...form.register('required')}
//                 {...field}
//                 placeholder="Add a required value"
//               />
//                   </Form.Control>
//                 </Form.Item>
//               )}
//             /> */}
//           </Form.Content>
//         </ScrollArea>
//         <Form.Footer className="space-x-2 flex justify-end py-2 border-t">
//           <Button
//             variant="outline"
//             type="button"
//             onClick={() => setShowPreview(true)}
//           >
//             Cancel
//           </Button>
//           <Button
//             type="button"
//             onClick={form.handleSubmit(onSubmit)}
//             disabled={!form.formState.isValid}
//           >
//             {field ? 'Update' : 'Add'}
//           </Button>
//         </Form.Footer>
//       </form>
//     </Form>
//   );
// }

// function Preview({
//   inputFields,
//   onBuildInputField,
// }: {
//   inputFields: any[];
//   onBuildInputField: ({ type }: { type: FieldConfig['inputType'] }) => void;
// }) {
//   /**
//    * This form doesn't do anything because we're not actually submitting htis.
//    */
//   const form = useForm<CreateFieldConfigType>({
//     resolver: zodResolver(createFieldConfigSchema),
//     defaultValues: {},
//   });

//   return (
//     <Form {...form}>
//       <form className="flex-1 h-full max-h-[80dvh] flex flex-col">
//         {inputFields.length === 0 ? (
//           <Form.Header className="h-full">
//             <EmptyPlaceholder
//               className="h-full"
//               title={'No fields'}
//               description={'Build your action with the fields you need.'}
//               buttonComponent={() =>
//                 SelectInputFieldDropdown({
//                   onBuildInputField,
//                 })
//               }
//             />
//           </Form.Header>
//         ) : (
//           <>
//             <Form.Header>
//               <Form.Title>Preview</Form.Title>
//               <Form.Subtitle>
//                 This preview isn't an exact representation of the final form.
//                 Multiple occurences, and nested fields won't be shown here.
//               </Form.Subtitle>
//             </Form.Header>
//             <ScrollArea>
//               <Form.Content className="space-y-6 pt-2 overflow-y-auto max-h-full">
//                 {inputFields.map((field) => (
//                   <DynamicFormField
//                     key={field.id}
//                     fieldConfig={field}
//                     formName="doesn't matter, not submitting this"
//                     form={form}
//                   />
//                 ))}
//               </Form.Content>
//             </ScrollArea>
//           </>
//         )}
//       </form>
//     </Form>
//   );
// }

// function SelectInputFieldDropdown({
//   onBuildInputField,
// }: {
//   onBuildInputField: ({ type }: { type: FieldConfig['inputType'] }) => void;
// }) {
//   return (
//     <DropdownMenu>
//       <div className="flex justify-end">
//         <DropdownMenu.Trigger asChild>
//           <Button variant="outline" className="space-x-2">
//             <Icons.plus />
//             <span>Add Field</span>
//           </Button>
//         </DropdownMenu.Trigger>
//       </div>
//       <DropdownMenu.Content>
//         <DropdownMenu.Item onClick={() => onBuildInputField({ type: 'input' })}>
//           Text
//         </DropdownMenu.Item>
//         <DropdownMenu.Item onClick={() => onBuildInputField({ type: 'file' })}>
//           File
//         </DropdownMenu.Item>
//         <DropdownMenu.Item
//           onClick={() => onBuildInputField({ type: 'select' })}
//         >
//           Select
//         </DropdownMenu.Item>
//         <DropdownMenu.Item
//           onClick={() => onBuildInputField({ type: 'multi-select' })}
//         >
//           Multi-Select
//         </DropdownMenu.Item>
//         <DropdownMenu.Item
//           onClick={() => onBuildInputField({ type: 'switch' })}
//         >
//           Switch
//         </DropdownMenu.Item>
//         <DropdownMenu.Item onClick={() => onBuildInputField({ type: 'date' })}>
//           Date
//         </DropdownMenu.Item>
//         <DropdownMenu.Item
//           onClick={() => onBuildInputField({ type: 'date-range' })}
//         >
//           Date Range
//         </DropdownMenu.Item>
//       </DropdownMenu.Content>
//     </DropdownMenu>
//   );
// }

// function FieldItem({
//   field,
//   onDeleteField,
//   onBuildInputField,
// }: {
//   field: FieldConfig;
//   onDeleteField: (fieldId: string) => void;
//   onBuildInputField: ({
//     type,
//     inputField,
//   }: {
//     type: FieldConfig['inputType'];
//     inputField?: FieldConfig;
//   }) => void;
// }) {
//   return (
//     <Card>
//       <Card.Header className="flex flex-row justify-between items-center py-2 overflow-hidden">
//         <Card.Title className="line-clamp-2 max-w-full">
//           {field.label}
//         </Card.Title>
//         <DropdownMenu>
//           <DropdownMenu.Trigger asChild>
//             <Button size="icon" variant="outline">
//               <Icons.dotsHorizontal />
//             </Button>
//           </DropdownMenu.Trigger>
//           <DropdownMenu.Content>
//             <DropdownMenu.Item
//               onSelect={() => {
//                 onBuildInputField({ type: field.inputType, inputField: field });
//               }}
//             >
//               Edit
//             </DropdownMenu.Item>
//             <DropdownMenu.Item
//               className="text-destructive"
//               // onSelect={(e) => e.preventDefault()}
//               onSelect={() => {
//                 onDeleteField(field.id);
//               }}
//             >
//               Delete
//             </DropdownMenu.Item>
//           </DropdownMenu.Content>
//         </DropdownMenu>
//       </Card.Header>
//     </Card>
//   );
// }

// function SuccessFormContent({ variant }: { variant: 'create' | 'edit' }) {
//   return (
//     <>
//       <Form.Content>
//         <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
//           <Icons.check className="w-12 h-12 text-success" />
//           <Form.Title>
//             {variant === 'create' ? 'Action created' : 'Action updated'}
//           </Form.Title>
//           <Form.Description>
//             {variant === 'create'
//               ? 'The action has been created successfully.'
//               : 'The action has been updated successfully.'}
//           </Form.Description>
//         </div>
//       </Form.Content>
//       <Form.Footer className="space-x-2 flex justify-end">
//         <Dialog.Close asChild>
//           <Button variant="outline">Done</Button>
//         </Dialog.Close>
//       </Form.Footer>
//     </>
//   );
// }

// function ErrorFormContent({ variant }: { variant: 'create' | 'edit' }) {
//   return (
//     <>
//       <Form.Content>
//         <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
//           <Icons.x className="w-12 h-12 text-error" />
//           <Form.Title>
//             {variant === 'create'
//               ? 'Action creation failed'
//               : 'Action update failed'}
//           </Form.Title>
//           <Form.Description className="text-center">
//             {variant === 'create'
//               ? 'Could not create an action.'
//               : 'Could not update the action.'}{' '}
//             Please try again.
//           </Form.Description>
//         </div>
//       </Form.Content>
//       <Form.Footer className="space-x-2 flex justify-end">
//         <Dialog.Close asChild>
//           <Button variant="outline">Done</Button>
//         </Dialog.Close>
//       </Form.Footer>
//     </>
//   );
// }
