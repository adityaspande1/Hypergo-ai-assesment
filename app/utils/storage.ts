import { Form, FormSubmission } from "~/models/form";

const FORMS_STORAGE_KEY="form-builder-forms";
const SUBMISSIONS_STORAGE_KEY="form-builder-submissions";


// function to save forms to local storage

export function saveForm(form:Form):void {
    if(typeof window !== 'undefined') return;

    const forms=getAllForms();
    const existingFormIndex=forms.findIndex((f:any)=>f.id===form.id);

    if(existingFormIndex>=0){
        // this means the form already existed.
        forms[existingFormIndex]={
            ...form,
        updatedAt:new Date(),
        };
        
    }
    else{
        // if not push this new form to the array.
        forms.push(form);
    }


    localStorage.setItem(FORMS_STORAGE_KEY,JSON.stringify(forms));

}


// function to get a form by id from local storage.

export function getFormById(id:string): Form|null {
    if(typeof window ==='undefined') return null;

    const forms=getAllForms();

    const form= forms.find((f:any)=>f.id===id);

    return form||null;
}


// function to get all forms from local storage.

export function getAllForms():Form[]{
    if(typeof window==='undefined') return [];


    try{
        const formsJson= localStorage.getItem(FORMS_STORAGE_KEY);
        if(!formsJson){
            return [];
        }
        const forms= JSON.parse(formsJson) as Form[];
        return forms.map(form => ({
            ...form,
            createdAt: new Date(form.createdAt),
            updatedAt: new Date(form.updatedAt),
          }));
        } catch (error) {
          console.error('Error loading forms from local storage:', error);
          return [];
        }

}

//function to save a form submission

export function saveSubmission(submission:FormSubmission):void{
    if(typeof window==='undefined') return ;

    const submissions=getAllSubmission();

    submissions.push(submission);

    localStorage.setItem(SUBMISSIONS_STORAGE_KEY,JSON.stringify(submissions));
}

// function to get all submsiiosn for a form 

export function getFormSubmissions(id:string):FormSubmission[]{
    if(typeof window==='undefined') return [];

    const allSubmissions=getAllSubmission();

    return allSubmissions.filter((s:any)=>{
        s.id===id;
    });
}

// function to get all submissions

export function getAllSubmission():FormSubmission[]{
    if(typeof window==='undefined') return [];
    try{
        const allSubmissions=localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
        if(!allSubmissions){
            return [];
        }
        const submissions=JSON.parse(allSubmissions) as FormSubmission[];


        // convertin data string to data objects

        return submissions.map(sub=>({
            ...sub,
            submittedAt: new Date(sub.submittedAt),
        }));

    }
    catch(error){
        console.log('Error loading data from the local storage');
        return [];
    }

    
}

// function to generate sharable url for form

export function getFormSharableURL(formId:string):string{
    if(typeof window==='undefined') return ' ';

    const baseUrl=window.location.origin;

    return `${baseUrl}/form-viewer/${formId}`;

}