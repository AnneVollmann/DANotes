import { inject, Injectable } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { query, orderBy, limit, where, Firestore, collection, doc, addDoc, collectionData, onSnapshot, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Title } from '@angular/platform-browser';
// import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class NoteListService {
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];
  unsubNotes;
  unsubMarkedNotes;
  unsubTrash;

  // items$;
  // items;
  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubNotes = this.subNotesList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
    this.unsubTrash = this.subTrashList();

    // this.items$ = collectionData(this.getNotesRef());
    // this.items = this.items$.subscribe((list) => {
    //   list.forEach(element => {
    //     console.log(element)
    //   });
    // })
  }

  async deleteNote(colId: "notes" | "trash", docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
      (err) => console.error(err));
  }

  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNotes(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (err) => { console.error(err); }
      );
    }
  }

  //Hilfsfunktion, weil Bezeichnung in firebases 'notes' und hier 'note'
  getColIdFromNotes(note: Note) {
    if (note.type == 'note') {
      return 'notes'
    } else {
      return 'trash'
    }
  }

  //Hilfsfunktion, weil bei updateDoc note zu sehr spezifiziert wäre mit type 'Note' 
  //-> sie müsste als '{}' definiert sein
  getCleanJson(note: Note): {} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    }
  }

  async addNote(item: Note, colId: "note" | "trash") {
    const ref = colId === 'note' ? this.getNotesRef() : this.getTrashRef();
    await addDoc(ref, item).catch(err => console.error(err));
  }

  ngOnDestroy() {
    this.unsubNotes();
    this.unsubMarkedNotes();
    this.unsubTrash();
    // this.items.unsubscribe();
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  // // Version der Fkt. ohne Filter und Limit (z.B. für kleinere Abfragen)
  // // subNotesList() {
  // //   return onSnapshot(this.getNotesRef(), (list) => {
  // //     this.normalNotes = [];
  // //     list.forEach(element => {
  // //       this.normalNotes.push(this.setNoteObject(element.data(), element.id));
  // //     });
  // //   });
  // // }

  // THEORIE: on-Snapshot mit Filter und Limit
  // Wichtig: where und orderBy gehen nicht zusammen
  // subNotesList() {
  //   const q = query(this.getNotesRef(), where("state", "==", "CA"), orderBy("title") limit(100))
  //   return onSnapshot(q, (list) => {
  //     this.normalNotes = [];
  //     list.forEach(element => {
  //       this.normalNotes.push(this.setNoteObject(element.data(), element.id));
  //     });
  //   });
  // }


  //Auskommentiertes zeigt Dinge an, die in Subcollection sind 
  subNotesList() {
    //Var.1
    // let ref = collection(doc(collection(this.firestore, "notes"), "hErYF3MV5RWJ9YLBohoL"), "notesExtra")
    // const q = query(ref, limit(100))

    //Var.2
    // let ref = collection(this.firestore, "notes/hErYF3MV5RWJ9YLBohoL/notesExtra");
    // const q = query(ref, limit(100));

    const q = query(this.getNotesRef(), limit(100))
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
      list.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("added Note: ", change.doc.data());
        }
        if (change.type === "modified") {
          console.log("modified Note: ", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("deleted Note: ", change.doc.data());
        }
      })
    });
  }

  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(100))
    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = [];
      list.forEach(element => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false,
    }
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}