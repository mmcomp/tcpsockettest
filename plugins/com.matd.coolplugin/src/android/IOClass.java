package com.matd.coolplugin;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.net.Socket;
import java.net.UnknownHostException;

import android.content.Context;

public class IOClass {
	Boolean isTcp = true;
	String SERVER_IP = "192.168.0.3";
	int SERVER_PORT = 43002;
	Boolean connected = false;
	Socket socket;
	String SockError="";
	static long CRC16 = 0;
	Boolean crcok = false;
	int bfs = 65;
	Context mContext;
	
	public IOClass(String IPAddr,int port,Context inContext)
	{
		mContext = inContext;
			if(!IPAddr.equals(""))
				SERVER_IP = IPAddr;
			if(port > 0)
				SERVER_PORT = port;
	}
	public IOClass(String IPAddr,Context inContext)
	{
		mContext = inContext;
			if(!IPAddr.equals(""))
				SERVER_IP = IPAddr;
	}
	public IOClass(int port,Context inContext)
	{
		mContext = inContext;
			if(port > 0)
				SERVER_PORT = port;
	}
	public IOClass(Context inContext)
	{
		mContext = inContext;
	}
	public void open()
	{
			if(socket != null)
				connected = socket.isConnected();
			else
				connected = false;
			if(!connected)
			{
				try {
					InetAddress serverAddr = InetAddress.getByName(SERVER_IP);
					socket = new Socket(serverAddr, SERVER_PORT);
					connected = true;
					SockError = "";
				} catch (UnknownHostException e) {
					SockError = "Open() UnknownHostException : "+e.getMessage();
				} catch (IOException e) {
					SockError = "Open() IOException : "+e.getMessage();
				} catch (Exception e) {
					SockError = "Open() Exception : "+e.getMessage();
				}
			}
	}
	public static long CRCCheck(int[] by)
	{
        long crc16,Temp;
        long crc = 65535;
        for(int i = 0;i < by.length;i++)
        {
                Temp = crc;
                crc = (int) (Temp ^ by[i]);
                for(int j = 0;j < 8;j++)
                {
                        if((crc & 1)==1)
                                crc = ((crc >> 1) ^ 40961);
                        else
                                crc = (crc >> 1);
                }
        }
        crc16 = crc & 65535;
        return crc16;
	}
	public static int[] longToBytes(long x) {
		int[] out = new int[2];
		out[0] = (int)(x % 256);
		out[1] = (int)(x / 256);
		return(out);
	}
	public static int unsignedByte(byte b)
	{
		int out;
		out = (b < 0)?b+256:b;
		return out;
	}
	public long bytesToLong(int[] b)
	{
		long out = 0;
		if(b.length == 2)
			out = b[1]*256+b[0];
		return out;
	}
	public Boolean dataValidate(int[] sts)
	{
		Boolean out = false;
		int[] tmp = new int[bfs-2];
		int[] crc = new int[2];
		for(int i = 0;i < (bfs-2);i++)
			tmp[i] = sts[i];
		crc[0] = sts[bfs-2];
		crc[1] = sts[bfs-1];
		CRC16 = CRCCheck(tmp);
		out = (bytesToLong(crc)==CRC16);
		return out;
	}
	public String byteArrayToString(byte[] inp)
	{
		String outStr = "";
		for(int strI = 0;strI < inp.length;strI++)
			outStr += ((outStr!="")?",":"")+String.valueOf(inp[strI]);
		return(outStr);
	}
	public String intArrayToString(int[] inp)
	{
		String outStr = "";
		for(int strI = 0;strI < inp.length;strI++)
			outStr += ((outStr!="")?",":"")+String.valueOf(inp[strI]);
		return(outStr);
	}
	public int[] sendData(int[] b)
	{
		int[] sts = null;
		try {
			int[] bbb = b;
			int[] localB = new int[bbb.length+2];
			for(int j=0;j < bbb.length;j++)
				localB[j] = bbb[j];
			Long crc16l = CRCCheck(bbb);
			int[] crc16 = new int[2];
			crc16 = longToBytes(crc16l);
			localB[bbb.length] = crc16[0];
			localB[bbb.length+1] = crc16[1];
			byte[] localBB = new byte[bbb.length+2];
			for(int i = 0;i < localB.length;i++)
				localBB[i] = (byte)localB[i];
			byte[] tmp_sts = new byte[1024];
				DataOutputStream outToServer = new DataOutputStream(socket.getOutputStream());
				DataInputStream inFromServer = new DataInputStream(socket.getInputStream());
				outToServer.write(localBB);
				sts = new int[bfs];
				inFromServer.read(tmp_sts);
			for(int i = 0;i < bfs;i++)
				sts[i] = (tmp_sts[i]>=0)?(int)tmp_sts[i]:(int)(tmp_sts[i]+256);
			crcok = dataValidate(sts);
			crcok = (crcok && (sts[1] > 0));

		} catch (IOException e) {
			connected = false;
			SockError = "SendData() IOException : "+e.getMessage();
		} catch (Exception e) {
			connected = false;
			SockError = "SendData() Exception : "+e.getMessage();
		}
		return sts;
	}
	public void sendSimpleData(int[] b)
	{
		try {
			//byte[] tmp_sts = new byte[1024];
			byte[] bb = new byte[b.length];
			for(int i = 0;i < b.length;i++)
				bb[i] = (byte)b[i];
			DataOutputStream outToServer = new DataOutputStream(socket.getOutputStream());
			//DataInputStream inFromServer = new DataInputStream(socket.getInputStream());
			outToServer.write(bb);
			//inFromServer.read(tmp_sts);

		} catch (IOException e) {
			connected = false;
			SockError = "SendData() IOException : "+e.getMessage();
		} catch (Exception e) {
			connected = false;
			SockError = "SendData() Exception : "+e.getMessage();
		}
	}
}
