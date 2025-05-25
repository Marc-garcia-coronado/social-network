package utils

import "testing"

func Sum(a, b int) int {
	return a + b
}

func IsEven(n int) bool {
	return n%2 == 0
}

func Max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func TestSum(t *testing.T) {
	got := Sum(3, 4)
	want := 7
	if got != want {
		t.Errorf("Sum(3, 4) = %d; want %d", got, want)
	}
}

func TestIsEvenTrue(t *testing.T) {
	if !IsEven(4) {
		t.Error("Expected IsEven(4) to be true")
	}
}

func TestIsEvenFalse(t *testing.T) {
	if IsEven(5) {
		t.Error("Expected IsEven(5) to be false")
	}
}

func TestMaxFirst(t *testing.T) {
	if Max(10, 5) != 10 {
		t.Error("Expected Max(10, 5) = 10")
	}
}

func TestMaxSecond(t *testing.T) {
	if Max(3, 9) != 9 {
		t.Error("Expected Max(3, 9) = 9")
	}
}