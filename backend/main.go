package main

import (
	"fmt"
	"log"
)

func main() {
	store, err := NewPostgresStore()
	if err != nil {
		log.Fatal(err)
	}
	defer store.db.Close()

	if err := store.CreateUserTable(); err != nil {
		fmt.Println("No se ha creado la tabla de users")
	}

	server := NewAPIServer(":3000", store)
	server.Run()
}
