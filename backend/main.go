package main

import (
	"fmt"
	"github.com/Marc-Garcia-Coronado/socialNetwork/routes"
	"github.com/Marc-Garcia-Coronado/socialNetwork/storage"
	"log"
)

func main() {
	store, err := storage.NewPostgresStore()
	if err != nil {
		log.Fatal(err)
	}
	defer store.Db.Close()

	if err := store.Init(); err != nil {
		fmt.Println("No se ha creado la tabla de users")
	}

	server := routes.NewAPIServer(":3000", store)
	server.Run()
}
