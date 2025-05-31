export type FieldType =
|'text'
|'textarea'
|'dropdown'
|'checkbox'
|'radio'
|'number'
|'email'
|'password'
;



// interface for performing Fild Validation
export interface FieldValidation{
    required?:boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
}
//interface for different options in the form 
export interface FieldOptions{
    label:string;
    value:string;
}
//interface for the field of the form
export interface FormField {
    id:string;
    type:FieldType;
    label:string;
    name:string;
    placeholder?:string;
    options?:FieldOptions[];
    validation?:FieldValidation;
}

//interface for the whole Form
export interface Form{
    id:string;
    title:string;
    description:string;
    createdAt:Date;
    updatedAt:Date;
    isPublished:boolean;
    fields:FormField[];
    submissions:FormSubmission[];

}
//interface for the data of submited form.
export interface FormSubmission {
    id: string;
    formId: string;
    data: Record<string, any>;
    submittedAt: Date;
  } 