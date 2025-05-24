package main

import (
	"log"
	"os"

	"github.com/Marc-Garcia-Coronado/socialNetwork/routes"
	"github.com/Marc-Garcia-Coronado/socialNetwork/storage"
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

	server := routes.NewAPIServer(":" + os.Getenv("PORT"), store)
	server.Run()
}
