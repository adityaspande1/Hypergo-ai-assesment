import {nanoid} from "nanoid";
import type {Form,FormField,FieldType} from "~/models/form";

//function to create a new empty form

export function createNewForm():Form{
    const date = new Date();
    const formId=nanoid();
    return {
        id:formId,
        title:'Untitled Form',
        description:'',
        createdAt:date,
        updatedAt:date,
        isPublished:false,
        fields:[],
        submissions:[]
    }
}