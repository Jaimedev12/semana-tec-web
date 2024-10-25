// import {firestore, DocumentReference, CollectionReference} from '../firebase';
import {firestore} from "./firebase";
import {CollectionReference, DocumentReference, FieldValue, QuerySnapshot, WriteResult} from "@google-cloud/firestore";
import {ZodObject, ZodSchema} from "zod";

class FirestoreService<T> {
    private readonly collectionName: string;
    private schema: ZodSchema<T>;
    private readonly parentDocRef?: DocumentReference;

    constructor(collectionName: string, schema: ZodSchema<T>, parentDocRef?: DocumentReference) {
        this.collectionName = collectionName;
        this.schema = schema;
        this.parentDocRef = parentDocRef;
    }

    protected get collection(): CollectionReference {
        if (this.parentDocRef) {
            return this.parentDocRef.collection(this.collectionName);
        }
        return firestore.collection(this.collectionName);
    }

    async incrementField(id: string, field: string, value: number): Promise<WriteResult> {
        return await this.collection.doc(id).update({
            [field]: FieldValue.increment(value),
        });
    }

    async add(doc: T): Promise<DocumentReference> {
        const parsedDoc = this.schema.parse(doc);
        return this.collection.add(parsedDoc as any);
    }

    async createBlankDoc() {
        return await this.collection.add({});
    }

    async getById(id: string): Promise<T> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) {
            this.throwNotFoundError();
        }

        return this.schema.parse(doc.data());
    }

    async query(
        conditions?: { field: string, operator: FirebaseFirestore.WhereFilterOp, value: any }[] | null,
        orderBy?: { field: string, direction: "asc" | "desc" }[] | null,
        limit?: number | null
    ): Promise<any[]> {
        let query: FirebaseFirestore.Query = this.collection;
        if (conditions) {
            // Apply where conditions
            conditions.forEach((condition) => {
                query = query.where(condition.field, condition.operator, condition.value);
            });
        }

        // Apply orderBy conditions if provided
        if (orderBy) {
            orderBy.forEach((order) => {
                query = query.orderBy(order.field, order.direction);
            });
        }

        // Apply limit if provided
        if (limit) {
            query = query.limit(limit);
        }

        const docs = await query.get();

        return docs.docs.map((doc) => {
            return {
                id: doc.id,
                ...doc.data(),
            };
        });
    }

    async getAll(): Promise<QuerySnapshot> {
        return await this.collection.get();
    }

    async getAllDocData(): Promise<T[]> {
        const docs = await this.collection.get();
        return docs.docs.map((doc) => {
            const data = doc.data();
            return this.schema.parse(data);
        });
    }

    async exists(id: string): Promise<boolean> {
        const doc = await this.collection.doc(id).get();
        return doc.exists;
    }

    async update(id: string, doc: Partial<T>): Promise<WriteResult> {
    // Parcial porque no se requiere que todos los campos estén presentes
        const parsedDoc = (this.schema as unknown as ZodObject<any>).partial().parse(doc);
        if (!(await this.exists(id))) {
            this.throwNotFoundError();
        }
        return await this.collection.doc(id).update(parsedDoc);
    }

    async set(id: string, doc: T): Promise<WriteResult> {
        const parsedDoc = this.schema.parse(doc); // Validate the document
        return await this.collection.doc(id).set(parsedDoc as any);
    }

    async delete(id: string): Promise<WriteResult> {
        return await this.collection.doc(id).delete();
    }

    async batchDeleteInCollection(ids: string[]): Promise<WriteResult[]> {
        const batch = firestore.batch();
        ids.forEach((id) => {
            const docRef = this.collection.doc(id);
            batch.delete(docRef);
        });
        return await batch.commit();
    }

    protected throwNotFoundError() {
        throw new Error("Document not found");
    }
}

export default FirestoreService;
