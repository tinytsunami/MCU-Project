// MCU-Project.cpp: �D�n�M���ɡC

#include "stdafx.h"
#include "MainForm.h"

using namespace System;
using namespace System::Windows::Forms;

[STAThreadAttribute]
void Main (array<String^>^ args) {
	Application::EnableVisualStyles ();
	Application::SetCompatibleTextRenderingDefault (false);
	MCUProject::MainForm form;
	Application::Run (%form);
}