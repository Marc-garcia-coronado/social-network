package main

import (
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
		log.Fatal(err)
	}

	log.Println("Todas las tablas se han creado exitosamente!")

	server := routes.NewAPIServer(":3000", store)
	server.Run()
}
